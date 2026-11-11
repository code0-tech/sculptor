import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Flex,
    InputDescription,
    InputLabel,
    TagInput,
    TagInputTrigger,
    TagInputValue,
    TagValue,
    Text,
    useService
} from "@code0-tech/pictor";
import {useDebouncedCallback} from "use-debounce";
import {
    Flow,
    InlineReferenceValue,
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {ListInput, NodeSchema} from "@code0-tech/triangulum";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {
    ListEntry,
    listCurrentEntries,
    listElementSuggestions,
    listInitialArray,
    listInitialLiteral,
    listReferences,
    listTagKeys,
    listValueKey,
    toListEntry,
    toListLiteral
} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";
import {DataTypeInputMenuSuggestionsComponent} from "@edition/datatype/components/inputs/DataTypeInputMenuSuggestionsComponent";
import {ReferenceEntryBadgeComponent} from "@edition/datatype/components/badges/ReferenceEntryBadgeComponent";
import {DataTypeListTextMarkdownComponent} from "@edition/datatype/components/inputs/list-text/DataTypeListTextMarkdownComponent";
import {DataTypeMarkdownToggleComponent} from "@edition/datatype/components/inputs/markdown/DataTypeMarkdownToggleComponent";
import {isMarkdown} from "@edition/datatype/utils/DataTypeMarkdown.isMarkdown.util";
import {literalTokens} from "@edition/datatype/utils/DataTypeListText.literalTokens.util";
import {tagEntries} from "@edition/datatype/utils/DataTypeListText.tagEntries.util";
import {DataTypeListTextLiteralTagComponent} from "@edition/datatype/components/inputs/list-text/DataTypeListTextLiteralTagComponent";

export type DataTypeListTextInputComponentProps = DataTypeInputComponentProps

export const DataTypeListTextInputComponent: React.FC<DataTypeListTextInputComponentProps> = (props) => {

    const {schema, formValidation, title, initialValue, description, suggestions, onChange} = props

    const params = useParams()
    const flowService = useService(FlowService)

    const flowId: Flow['id'] = props.flowId ?? `gid://sagittarius/Flow/${Number(params.flowId) || 1}`
    const initialArray = listInitialArray(initialValue)
    const initialKey = JSON.stringify(initialArray)

    const tokens = React.useRef<string[]>([])
    const lastValueKey = React.useRef(listValueKey(initialArray, listInitialLiteral(initialValue)?.references))
    const tagsDirty = React.useRef(false)
    const frozenSeedKey = React.useRef(initialKey)
    const [revision, setRevision] = React.useState(0)
    const [openToken, setOpenToken] = React.useState<string | null>(null)
    const [preferMarkdown, setPreferMarkdown] = React.useState<boolean | null>(null)
    const [autoMarkdown, setAutoMarkdown] = React.useState<boolean | null>(null)

    const markdown = preferMarkdown ?? autoMarkdown ?? false
    const tagsSeedKey = tagsDirty.current ? frozenSeedKey.current : initialKey

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const listSchema = React.useMemo(
        () => (schema && "schema" in schema ? (schema as NodeSchema).schema : schema) as ListInput | undefined,
        [schema]
    )
    const elementSuggestions = React.useMemo(() => listElementSuggestions(schema, suggestions), [schema, suggestions])
    const tagKeys = React.useMemo(() => listTagKeys(elementSuggestions), [elementSuggestions])
    const referenceSuggestions = React.useMemo(() => suggestions ?? [], [suggestions])
    const tagTokens = React.useMemo(() => {
        const next = literalTokens(initialArray, tokens.current)
        tokens.current = next
        return next
    }, [initialKey])
    const initialTags = React.useMemo(() => tagTokens.map(value => ({value})), [tagTokens])
    const references = React.useMemo(() => listReferences(elementSuggestions, initialValue), [elementSuggestions, initialKey])
    const currentEntries = React.useMemo(() => listCurrentEntries(initialArray, references), [initialKey, references])

    const onChangeDebounced = useDebouncedCallback((
        changed: TagValue[] | LiteralValue | ReferenceValue | SubFlowValue | NodeFunction | null,
        entryIndex?: number
    ) => {

        if (!Array.isArray(changed) && entryIndex === undefined) {
            formValidation?.setValue?.(changed)
            onChange?.(changed)
            return
        }

        const changedTokens = Array.isArray(changed) ? changed.map(tag => String(tag.value)) : tokens.current

        const entries = Array.isArray(changed)
            ? tagEntries(changed, initialArray, tokens.current, references, flowService, flowId, props.nodeId)
            : Array.from({length: Math.max(currentEntries.length, (entryIndex ?? 0) + 1)}, (_, index) =>
                index === entryIndex
                    ? toListEntry(changed, flowService, flowId, props.nodeId)
                    : currentEntries[index])

        const literal = toListLiteral(entries, references, changedTokens,
            listInitialLiteral(initialValue)?.references ?? [])
        const key = listValueKey(literal.value, literal.references)
        if (key === lastValueKey.current) return

        tokens.current = changedTokens
        lastValueKey.current = key
        formValidation?.setValue?.(literal)
        onChange?.(literal)
    }, 400, {flushOnExit: true})

    const onEntriesChangeDebounced = useDebouncedCallback((
        entries: ListEntry[],
        inline: InlineReferenceValue[] = []
    ) => {

        const literal = toListLiteral(entries, references, undefined, inline)
        const key = listValueKey(literal.value, literal.references)
        if (key === lastValueKey.current) return

        lastValueKey.current = key
        formValidation?.setValue?.(literal)
        onChange?.(literal)
    }, 400, {flushOnExit: true})

    const onToggle = React.useCallback(() => {
        onChangeDebounced.flush()
        onEntriesChangeDebounced.flush()
        tagsDirty.current = false
        setPreferMarkdown(!markdown)
        setRevision(current => current + 1)
    }, [markdown, onChangeDebounced, onEntriesChangeDebounced])

    const onTagsChange = React.useCallback((
        value: TagValue[] | LiteralValue | ReferenceValue | SubFlowValue | NodeFunction | null,
        entryIndex?: number
    ) => {
        frozenSeedKey.current = tagsDirty.current ? frozenSeedKey.current : initialKey
        tagsDirty.current = true
        onChangeDebounced(value, entryIndex)
        if (entryIndex !== undefined) onChangeDebounced.flush()
    }, [initialKey, onChangeDebounced])

    React.useEffect(() => {
        if (autoMarkdown !== null || initialArray.length === 0) return
        setAutoMarkdown(initialArray.some(entry => typeof entry === "string" && isMarkdown(entry)))
    }, [initialKey, autoMarkdown])

    return React.useMemo(() => {
        const toggle = <DataTypeMarkdownToggleComponent markdown={markdown}
                                                        plainIcon={"tabler:tags"}
                                                        plainLabel={"Edit items as tags"}
                                                        markdownLabel={"Edit items as markdown"}
                                                        onToggle={onToggle}/>

        const header = <>
            {title && <InputLabel>{title}</InputLabel>}
            {description && <InputDescription>{description}</InputDescription>}
        </>

        if (markdown) return <>
            {header}
            <DataTypeListTextMarkdownComponent key={revision}
                                               entries={currentEntries}
                                               references={listInitialLiteral(initialValue)?.references}
                                               suggestions={elementSuggestions}
                                               flowId={flowId}
                                               nodeId={props.nodeId}
                                               parameterIndex={props.parameterIndex}
                                               onChange={onEntriesChangeDebounced}
                                               toggle={toggle}/>
        </>

        return <>
            {header}
            <DataTypeInputValueComponent key={`${revision}-${tagsSeedKey}`}
                                         initialValue={initialValue}
                                         onChange={onTagsChange}
                                         suggestions={referenceSuggestions}
                                         formValidation={formValidation}>
                <TagInput allowCustomValues={true}
                          placeholder={typeof title === "string" ? title : undefined}
                          initialValue={initialTags}
                          maw={"100%"}
                          tokenRules={[
                              {
                                  pattern: /^\$\{literal_\d+}$/,
                                  void: true,
                                  wrap: matchedText => <DataTypeListTextLiteralTagComponent
                                      token={matchedText}
                                      index={tokens.current.indexOf(matchedText)}
                                      entries={initialArray}
                                      listSchema={listSchema}
                                      flowId={flowId}
                                      nodeId={props.nodeId}
                                      parameterIndex={props.parameterIndex}
                                      open={openToken === matchedText}
                                      onOpenChange={open => setOpenToken(open ? matchedText : null)}
                                      onChange={onTagsChange}/>
                              },
                              {
                                  pattern: /^\$\{.+}$/,
                                  void: true,
                                  wrap: matchedText => {
                                      const reference = references.get(matchedText)

                                      if (!reference) return <Text size={"sm"}>{matchedText}</Text>

                                      return <ReferenceEntryBadgeComponent value={reference}/>
                                  }
                              }
                          ]}
                          formValidation={{...formValidation, setValue: undefined}}
                          onChange={onTagsChange}
                          right={
                              <DataTypeInputControlsComponent suggestions={referenceSuggestions}
                                                              onSelect={onTagsChange}/>
                          }
                          rightType={"action"}>
                    <DataTypeInputMenuSuggestionsComponent suggestions={elementSuggestions}
                                                          tagKeys={tagKeys}
                                                          flowId={flowId}
                                                          nodeId={props.nodeId}
                                                          parameterIndex={props.parameterIndex}
                                                          onVariantSelect={value => onChangeDebounced(value, currentEntries.length)}/>
                    <TagInputValue/>
                    <TagInputTrigger/>
                </TagInput>
            </DataTypeInputValueComponent>
            <Flex style={{marginTop: "0.35rem"}}>{toggle}</Flex>
        </>
    }, [formValidation, defaultValue, elementSuggestions, tagKeys, references, markdown, revision, openToken, tagTokens])
}
