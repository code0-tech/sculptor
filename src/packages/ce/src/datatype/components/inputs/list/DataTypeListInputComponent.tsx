import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Flex,
    InputDescription,
    InputLabel,
    TagInput,
    TagInputMenuItem,
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
import {ListInput, NodeSchema, Schema} from "@code0-tech/triangulum";
import {IconPlus} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {
    DataTypeInputMenuSuggestionsComponent
} from "@edition/datatype/components/inputs/DataTypeInputMenuSuggestionsComponent";
import {
    DataTypeListInputItemMenuComponent
} from "@edition/datatype/components/inputs/list/DataTypeListInputItemMenuComponent";
import {
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
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {LiteralBadgeComponent} from "@edition/datatype/components/badges/LiteralBadgeComponent";

export type DataTypeListInputComponentProps = DataTypeInputComponentProps

export const DataTypeListInputComponent: React.FC<DataTypeListInputComponentProps> = (props) => {

    const {
        schema,
        formValidation,
        title,
        initialValue,
        description,
        suggestions,
        onChange,
        nodeId,
        parameterIndex
    } = props

    const params = useParams()
    const flowService = useService(FlowService)
    const flowId: Flow['id'] = props.flowId ?? `gid://sagittarius/Flow/${Number(params.flowId) || 1}`

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const [openToken, setOpenToken] = React.useState<string | null>(null)
    const addedShapes = React.useRef(new Map<number, Schema>())
    const listTokenIds = React.useRef<string[]>([])
    const nextTokenId = React.useRef(0)

    const listSchema = React.useMemo(
        () => (schema && "schema" in schema ? (schema as NodeSchema).schema : schema) as ListInput | undefined,
        [schema]
    )
    const itemsKey = JSON.stringify(listSchema?.items ?? [])

    const addEntries = React.useMemo(() => {
        const inner = listSchema ?? {} as ListInput
        const shapes = new Set<string>()
        const unique = (inner.declaredItems ?? []).filter(item => {
            const shape = `${item.input ?? "generic"}/${item.type ?? ""}`
            if (shapes.has(shape)) return false
            shapes.add(shape)
            return true
        })
        return unique.map((item, index) => {
            const kind = item.input ?? "value"
            const sameKind = unique.filter(candidate => candidate.input === item.input)
            return {
                key: `\${add_${index}}`,
                schema: item,
                label: sameKind.length > 1 ? `${kind} ${sameKind.indexOf(item) + 1}` : kind
            }
        })
    }, [schema])

    const elementSuggestions = React.useMemo(() => listElementSuggestions(schema, suggestions), [schema, suggestions])
    const tagKeys = React.useMemo(() => listTagKeys(elementSuggestions), [elementSuggestions])
    const referenceSuggestions = React.useMemo(() => suggestions ?? [], [suggestions])

    const initialArray = listInitialArray(initialValue)
    const initialKey = JSON.stringify(initialArray)
    const listTokens = React.useMemo(() => {
        const tokens = initialArray.reduce<string[]>((previousTokens, entry, index) => {
            if (typeof entry === "string" && /^\$\{.+}$/.test(entry)) return [...previousTokens, entry]
            const previous = listTokenIds.current[index]
            const stable = !!previous && /^\$\{literal_\d+}$/.test(previous) && !previousTokens.includes(previous)
            return [...previousTokens, stable ? previous : `\${literal_${nextTokenId.current++}}`]
        }, [])
        listTokenIds.current = tokens
        return tokens
    }, [initialKey])
    const initialTags = React.useMemo(() => listTokens.map(value => ({value})), [listTokens])
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

        if (entryIndex !== undefined && changed !== null) addedShapes.current.delete(entryIndex)

        const tokens = Array.isArray(changed)
            ? changed.map(tag => listTokenIds.current.includes(String(tag.value))
                ? String(tag.value)
                : `\${literal_${nextTokenId.current++}}`)
            : listTokenIds.current

        const entries = Array.isArray(changed)
            ? changed.map((tag, index) => {
                const tagKey = String(tag.value)

                if (tagKey.startsWith("${add_")) {
                    addedShapes.current.set(index, tag.valueData as Schema)
                    setOpenToken(tokens[index])
                    return null
                }

                const literalIndex = /^\$\{literal_\d+}$/.test(tagKey) ? listTokenIds.current.indexOf(tagKey) : -1

                if (literalIndex >= 0) return initialArray[literalIndex]

                const suggested = references.get(tagKey)

                if (!suggested) return tag.value

                const entry = toListEntry(suggested, flowService, flowId, nodeId)
                references.set(tagKey, entry as ReferenceValue | SubFlowValue)
                return entry
            })
            : Array.from({length: Math.max(currentEntries.length, (entryIndex ?? 0) + 1)}, (_, index) =>
                index === entryIndex
                    ? toListEntry(changed, flowService, flowId, nodeId)
                    : currentEntries[index])

        const literal = toListLiteral(entries, references, tokens)
        const key = listValueKey(literal.value, literal.references)
        if (key === lastValueKey.current) return

        listTokenIds.current = tokens
        lastValueKey.current = key
        formValidation?.setValue?.(literal)
        onChange?.(literal)
    }, 200, {flushOnExit: true})

    return React.useMemo(() => <>
        {title && <InputLabel>{title}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        <DataTypeInputValueComponent initialValue={initialValue}
                                     onChange={onChangeDebounced}
                                     suggestions={referenceSuggestions}
                                     nodeId={nodeId}
                                     parameterIndex={parameterIndex}
                                     formValidation={formValidation}>
            <TagInput allowCustomValues={true}
                      placeholder={typeof title === "string" ? title : undefined}
                      initialValue={initialTags}
                      maw={"100%"}
                      tokenRules={[
                          {
                              pattern: /^\$\{literal_(\d+)}$/,
                              void: true,
                              wrap: matchedText => {
                                  const index = listTokenIds.current.indexOf(matchedText)
                                  if (index < 0) return null
                                  const entry = initialArray[index]
                                  const entered = listSchema?.items?.length === initialArray.length
                                      ? listSchema?.items?.[index]
                                      : undefined
                                  const target = entry === null || entry === undefined
                                      ? addedShapes.current.get(index) ?? listSchema?.declaredItems?.[0]
                                      : entered ?? addedShapes.current.get(index)

                                  return <DataTypeListInputItemMenuComponent
                                      schema={target}
                                      initialValue={entry === null || entry === undefined
                                          ? undefined
                                          : {__typename: "LiteralValue", value: entry} as LiteralValue}
                                      flowId={flowId}
                                      nodeId={nodeId}
                                      parameterIndex={parameterIndex}
                                      open={openToken === matchedText}
                                      onOpenChange={open => setOpenToken(open ? matchedText : null)}
                                      onChange={change => {
                                          onChangeDebounced(change ?? null, index)
                                          onChangeDebounced.flush()
                                      }}>
                                      <LiteralBadgeComponent schema={target}
                                                             value={{__typename: "LiteralValue", value: entry}}/>
                                  </DataTypeListInputItemMenuComponent>
                              }
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
                                                          nodeId={nodeId}
                                                          parameterIndex={parameterIndex}
                                                          onSelect={onChangeDebounced}/>
                      }
                      rightType={"action"}>
                <DataTypeInputMenuSuggestionsComponent suggestions={elementSuggestions}
                                                       tagKeys={tagKeys}
                                                       flowId={flowId}
                                                       nodeId={nodeId}
                                                       parameterIndex={parameterIndex}
                                                       onVariantSelect={value => onChangeDebounced(value, currentEntries.length)}>
                    {addEntries.map(entry => (
                        <TagInputMenuItem key={entry.key} value={entry.key} data={entry.schema}
                                          aliases={[`add ${entry.label}`, entry.label]}>
                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                <IconPlus size={13}/>
                                <Text>Add {entry.label}</Text>
                            </Flex>
                        </TagInputMenuItem>
                    ))}
                </DataTypeInputMenuSuggestionsComponent>
                <TagInputValue/>
                <TagInputTrigger/>
            </TagInput>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue, addEntries, elementSuggestions, referenceSuggestions, tagKeys, references, listTokens, openToken, initialKey, itemsKey])
}
