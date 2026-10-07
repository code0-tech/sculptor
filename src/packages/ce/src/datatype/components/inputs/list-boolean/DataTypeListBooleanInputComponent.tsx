import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Badge,
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
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {
    listCurrentEntries,
    listElementSuggestions,
    listInitialArray,
    listInitialLiteral,
    listInitialTags,
    listReferences,
    listTagKeys,
    listValueKey,
    toListEntry,
    toListLiteral
} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";
import {
    DataTypeInputMenuSuggestionsComponent
} from "@edition/datatype/components/inputs/DataTypeInputMenuSuggestionsComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";

export type DataTypeListBooleanInputComponentProps = DataTypeInputComponentProps

export const DataTypeListBooleanInputComponent: React.FC<DataTypeListBooleanInputComponentProps> = (props) => {

    const {schema, formValidation, title, initialValue, description, suggestions, onChange} = props

    const params = useParams()
    const flowService = useService(FlowService)
    const flowId: Flow['id'] = props.flowId ?? `gid://sagittarius/Flow/${Number(params.flowId) || 1}`

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])

    const elementSuggestions = React.useMemo(() => listElementSuggestions(schema, suggestions), [schema, suggestions])
    const tagKeys = React.useMemo(() => listTagKeys(elementSuggestions), [elementSuggestions])
    const referenceSuggestions = React.useMemo(() => suggestions ?? [], [suggestions])

    const initialArray = listInitialArray(initialValue)
    const initialKey = JSON.stringify(initialArray)
    const initialTags = React.useMemo(() => listInitialTags(initialArray), [initialKey])
    const references = React.useMemo(() => listReferences(elementSuggestions, initialValue), [elementSuggestions, initialKey])
    const currentEntries = listCurrentEntries(initialArray, references)
    const lastValueKey = React.useRef(listValueKey(initialArray, listInitialLiteral(initialValue)?.references))

    const onChangeDebounced = useDebouncedCallback((
        changed: TagValue[] | LiteralValue | ReferenceValue | SubFlowValue | NodeFunction | null,
        entryIndex?: number
    ) => {

        if (!Array.isArray(changed) && entryIndex === undefined) {
            formValidation?.setValue?.(changed)
            onChange?.(changed)
            return
        }

        const entries = Array.isArray(changed)
            ? changed.map(tag => {
                const tagKey = String(tag.value)
                const suggested = references.get(tagKey)

                if (!suggested) return tag.value

                const entry = toListEntry(suggested, flowService, flowId, props.nodeId)
                references.set(tagKey, entry as ReferenceValue | SubFlowValue)
                return entry
            })
            : Array.from({length: Math.max(currentEntries.length, (entryIndex ?? 0) + 1)}, (_, index) =>
                index === entryIndex
                    ? toListEntry(changed, flowService, flowId, props.nodeId)
                    : currentEntries[index])

        const literal = toListLiteral(entries, references)
        const key = listValueKey(literal.value, literal.references)
        if (key === lastValueKey.current) return

        lastValueKey.current = key
        formValidation?.setValue?.(literal)
        onChange?.(literal)
    }, 400, {flushOnExit: true})

    return React.useMemo(() => <>
        {title && <InputLabel>{title}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        <DataTypeInputValueComponent initialValue={initialValue}
                                     onChange={onChangeDebounced}
                                     suggestions={referenceSuggestions}
                                     formValidation={formValidation}>
            <TagInput allowCustomValues={false}
                      placeholder={typeof title === "string" ? title : undefined}
                      initialValue={initialTags}
                      maw={"100%"}
                      tokenRules={[
                          {
                              pattern: /^true$/,
                              wrap: () => <Badge color={"success"}><Text c={"inherit"}>true</Text></Badge>
                          },
                          {
                              pattern: /^false$/,
                              wrap: () => <Badge color={"error"}><Text c={"inherit"}>false</Text></Badge>
                          },
                          {
                              pattern: /^\$\{.+}$/,
                              void: true,
                              wrap: matchedText => {
                                  const reference = references.get(matchedText)
                                  if (reference?.__typename === "ReferenceValue") return <ReferenceBadgeComponent
                                      value={reference}/>
                                  if (reference?.__typename === "SubFlowValue") return <NodeBadgeComponent
                                      value={reference}/>
                                  if (reference?.__typename === "NodeFunction") return <NodeBadgeComponent value={{
                                      __typename: "SubFlowValue",
                                      functionDefinition: reference.functionDefinition
                                  }}/>
                                  return null
                              }
                          }
                      ]}
                      formValidation={{...formValidation, setValue: undefined}}
                      onChange={onChangeDebounced}
                      right={
                          <DataTypeInputControlsComponent suggestions={referenceSuggestions}
                                                          onSelect={onChangeDebounced}/>
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
    </>, [formValidation, defaultValue, elementSuggestions, tagKeys, references])
}
