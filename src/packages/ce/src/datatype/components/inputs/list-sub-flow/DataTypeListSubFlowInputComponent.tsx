import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Button,
    InputDescription,
    InputLabel,
    TagInput,
    TagInputTrigger,
    TagInputValue,
    TagValue,
    useService
} from "@code0-tech/pictor";
import {useDebouncedCallback} from "use-debounce";
import {
    Flow,
    InlineReferenceValue,
    LiteralValue,
    NodeFunction,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {ListInput, NodeSchema, Schema} from "@code0-tech/triangulum";
import {ownSuggestionCertainties} from "@edition/datatype/utils/DataType.suggestionCertainties.util";
import {exactSuggestions} from "@edition/datatype/utils/DataType.exactSuggestions.util";
import {IconPlus} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {Suggestion} from "@edition/function/components/suggestion/Suggestion.util";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {
    DataTypeInputMenuSuggestionsComponent
} from "@edition/datatype/components/inputs/DataTypeInputMenuSuggestionsComponent";

export type DataTypeListSubFlowInputComponentProps = DataTypeInputComponentProps

export interface DataTypeListSubFlowInputItem {
    key: string
    value: SubFlowValue | ReferenceValue
}

export const DataTypeListSubFlowInputComponent: React.FC<DataTypeListSubFlowInputComponentProps> = (props) => {

    const {schema, formValidation, title, initialValue, description, suggestions, onChange} = props

    const params = useParams()
    const flowService = useService(FlowService)

    console.log(schema)

    const flowId: Flow['id'] = props.flowId ?? `gid://sagittarius/Flow/${Number(params.flowId) || 1}`

    const keyOf = (value: SubFlowValue | ReferenceValue) => {
        if (value.__typename === "ReferenceValue") return `\${node_${value.nodeFunctionId}}`
        const subFlow = value as SubFlowValue
        return subFlow.startingNodeId ?? subFlow.functionDefinition?.id ?? subFlow.signature ?? ""
    }

    const initialItems: DataTypeListSubFlowInputItem[] = ((initialValue as LiteralValue)?.__typename === "LiteralValue"
        ? ((initialValue as LiteralValue).references ?? [])
        : [])
        .map(reference => reference.value)
        .filter((value): value is SubFlowValue | ReferenceValue =>
            value?.__typename === "SubFlowValue" || value?.__typename === "ReferenceValue")
        .map(value => ({key: keyOf(value), value}))

    const [items, setItems] = React.useState<DataTypeListSubFlowInputItem[]>(initialItems)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [customLogicDialogOpen, setCustomLogicDialogOpen] = React.useState(false)
    const [tagsResetKey, setTagsResetKey] = React.useState(0)
    const [variantSuggestion, setVariantSuggestion] = React.useState<Suggestion | null>(null)
    const functionSuggestions = useFunctionSuggestions()

    const customLogicGroupKey = "${custom_logic_group}"
    const variantKeyPrefix = "${variant_"

    const declaredSuggestions = React.useMemo(() => {
        const inner = schema && "schema" in schema ? (schema as NodeSchema).schema : (schema as Schema | undefined)
        const declared = (inner as ListInput | undefined)?.declaredItems ?? []
        const certainties = new Map(declared.flatMap(item => [...ownSuggestionCertainties(item)]))
        const seen = new Set<string>()
        return exactSuggestions(declared.flatMap(item => item.suggestions ?? []), certainties)
            .filter((suggest): suggest is SubFlowValue | NodeFunction | ReferenceValue =>
                suggest.__typename === "SubFlowValue"
                || suggest.__typename === "NodeFunction"
                || suggest.__typename === "ReferenceValue")
            .filter(suggest => {
                const key = suggest.__typename === "ReferenceValue"
                    ? `ReferenceValue/${suggest.nodeFunctionId}`
                    : suggest.__typename === "SubFlowValue"
                        ? `SubFlowValue/${suggest.functionDefinition?.id ?? suggest.signature ?? ""}`
                        : suggest.__typename === "NodeFunction"
                            ? `NodeFunction/${suggest.functionDefinition?.id ?? ""}`
                            : ""
                if (seen.has(key)) return false
                seen.add(key)
                return true
            })
    }, [schema])

    const exactMatches = React.useMemo(
        () => exactSuggestions(suggestions ?? [], ownSuggestionCertainties(schema)),
        [schema, suggestions]
    )

    const hasDeclaredSuggestions = declaredSuggestions.length > 0

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 200)

    const tagKeys: string[] = React.useMemo(() => declaredSuggestions.map((suggest, index) =>
        suggest.__typename === "SubFlowValue" || suggest.__typename === "ReferenceValue"
            ? keyOf(suggest)
            : `\${reference_${index}}`
    ), [declaredSuggestions])

    const menuReferences = React.useMemo(() => {
        const map = new Map<string, SubFlowValue | ReferenceValue | NodeFunction>()
        declaredSuggestions.forEach((suggest, index) => {
            if (suggest.__typename === "SubFlowValue" || suggest.__typename === "ReferenceValue") {
                map.set(keyOf(suggest), suggest)
                return
            }
            map.set(`\${reference_${index}}`, suggest)
        })
        return map
    }, [declaredSuggestions])

    const byKey = new Map(items.map(item => [item.key, item.value]))
    const tagsKey = items.map(item => item.key).join("\0")
    const tags: TagValue[] = React.useMemo(
        () => items.map(item => ({value: item.key})),
        [tagsKey, tagsResetKey]
    )

    const lastValueKey = React.useRef(tagsKey)

    const commit = (next: DataTypeListSubFlowInputItem[]) => {
        const nextKey = next.map(item => item.key).join("\0")
        if (nextKey === lastValueKey.current) return
        lastValueKey.current = nextKey
        setItems(next)

        if (next.length === 0) {
            formValidation?.setValue?.(null)
            onChangeDebounced(null)
            return
        }

        const references: InlineReferenceValue[] = next.map((item, index) => ({
            __typename: "InlineReferenceValue",
            signature: `sub_flow_${index}`,
            value: item.value
        }))
        const literal: LiteralValue = {
            __typename: "LiteralValue",
            value: next.map((_, index) => `\${sub_flow_${index}}`),
            references
        }
        formValidation?.setValue?.(literal)
        onChangeDebounced(literal)
    }

    return <>
        <SuggestionDialogComponent suggestions={declaredSuggestions}
                                   flowId={flowId}
                                   nodeId={props.nodeId}
                                   parameterIndex={props.parameterIndex}
                                   open={dialogOpen}
                                   onOpenChange={setDialogOpen}
                                   onSuggestionSelect={value => {
                                       if (value?.__typename === "NodeFunction") {
                                           const addedNodeId = flowService.addPreviousNodeById(flowId, props.nodeId ?? null, value)
                                           if (!addedNodeId) return
                                           const reference: ReferenceValue = {
                                               __typename: "ReferenceValue",
                                               nodeFunctionId: addedNodeId
                                           }
                                           commit([...items, {key: keyOf(reference), value: reference}])
                                           return
                                       }
                                       if (value?.__typename !== "SubFlowValue") return
                                       commit([...items, {key: keyOf(value), value}])
                                   }}/>
        <SuggestionDialogComponent suggestions={functionSuggestions}
                                   flowId={flowId}
                                   nodeId={props.nodeId}
                                   parameterIndex={props.parameterIndex}
                                   open={customLogicDialogOpen}
                                   onOpenChange={setCustomLogicDialogOpen}
                                   onBackSelect={hasDeclaredSuggestions ? () => setDialogOpen(true) : undefined}
                                   onSuggestionSelect={value => {
                                       if (value?.__typename === "NodeFunction") {
                                           const nodeId = flowService.addNodeById(flowId, value)
                                           value = {__typename: "SubFlowValue", startingNodeId: nodeId}
                                       }
                                       if (value?.__typename !== "SubFlowValue") return
                                       commit([...items, {key: keyOf(value), value}])
                                   }}/>
        {title && <InputLabel>{title}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        <DataTypeInputValueComponent initialValue={initialValue}
                                     onChange={value => {
                                         formValidation?.setValue?.(value)
                                         onChangeDebounced(value)
                                     }}
                                     suggestions={exactMatches}
                                     formValidation={formValidation}>
            <TagInput allowCustomValues={false}
                      placeholder={typeof title === "string" ? title : undefined}
                      initialValue={tags}
                      maw={"100%"}
                      tokenRules={[
                          {
                              pattern: /.+/,
                              void: true,
                              wrap: matchedText => {
                                  const value = byKey.get(matchedText) ?? menuReferences.get(matchedText)
                                  if (value?.__typename === "SubFlowValue") return <NodeBadgeComponent value={value}/>
                                  if (value?.__typename === "ReferenceValue") return <ReferenceBadgeComponent
                                      value={value}/>
                                  if (value?.__typename === "NodeFunction") return <NodeBadgeComponent value={{
                                      __typename: "SubFlowValue",
                                      functionDefinition: value.functionDefinition
                                  }}/>
                                  return null
                              }
                          }
                      ]}
                      formValidation={{...formValidation, setValue: undefined}}
                      onChange={changed => {
                          const next: DataTypeListSubFlowInputItem[] = []

                          changed.forEach(tag => {
                              const key = String(tag.value)

                              if (key === customLogicGroupKey) {
                                  setCustomLogicDialogOpen(true)
                                  setTagsResetKey(current => current + 1)
                                  return
                              }

                              if (key.startsWith(variantKeyPrefix)) {
                                  setVariantSuggestion((tag.valueData as Suggestion | undefined) ?? null)
                                  setTagsResetKey(current => current + 1)
                                  return
                              }

                              const existing = byKey.get(key)

                              if (existing) {
                                  next.push({key, value: existing})
                                  return
                              }

                              const suggestion = menuReferences.get(key)
                              if (!suggestion) return

                              if (suggestion.__typename === "NodeFunction") {
                                  const addedNodeId = flowService.addPreviousNodeById(flowId, props.nodeId ?? null, suggestion)
                                  if (!addedNodeId) return

                                  const created: ReferenceValue = {
                                      __typename: "ReferenceValue",
                                      nodeFunctionId: addedNodeId
                                  }
                                  menuReferences.set(key, created)
                                  next.push({key, value: created})
                                  return
                              }

                              next.push({key, value: suggestion as SubFlowValue | ReferenceValue})
                          })

                          commit(next)
                      }}
                      right={
                          <DataTypeInputControlsComponent nodeId={props.nodeId}
                                                          parameterIndex={props.parameterIndex}
                                                          onSelect={value => {
                                                              if (value?.__typename === "SubFlowValue") {
                                                                  commit([...items, {key: keyOf(value), value}])
                                                                  return
                                                              }
                                                              if (!value) {
                                                                  commit([])
                                                                  return
                                                              }
                                                              setItems([])
                                                              formValidation?.setValue?.(value)
                                                              onChangeDebounced(value)
                                                          }}>
                              <Button paddingSize={"xxs"}
                                      onClick={() => {
                                          if (hasDeclaredSuggestions) setDialogOpen(true)
                                          else setCustomLogicDialogOpen(true)
                                      }}>
                                  <IconPlus size={13}/>
                              </Button>
                          </DataTypeInputControlsComponent>
                      }
                      rightType={"action"}>
                <DataTypeInputMenuSuggestionsComponent suggestions={declaredSuggestions}
                                                       tagKeys={tagKeys}
                                                       customLogicGroupKey={customLogicGroupKey}
                                                       flowId={flowId}
                                                       nodeId={props.nodeId}
                                                       parameterIndex={props.parameterIndex}
                                                       onVariantSelect={value => commit([...items, {
                                                           key: keyOf(value),
                                                           value
                                                       }])}/>
                <TagInputValue/>
                <TagInputTrigger/>
            </TagInput>
        </DataTypeInputValueComponent>
    </>
}
