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
import {NodeSchema, Schema} from "@code0-tech/triangulum";
import {IconPlus} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";

export type DataTypeListSubFlowInputComponentProps = DataTypeInputComponentProps

export const DataTypeListSubFlowInputComponent: React.FC<DataTypeListSubFlowInputComponentProps> = (props) => {

    const {schema, formValidation, title, initialValue, description, suggestions, onChange} = props

    const params = useParams()
    const flowService = useService(FlowService)

    const flowIndex = Number(params.flowId) || 1
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const initialSubFlows: SubFlowValue[] = ((initialValue as LiteralValue)?.__typename === "LiteralValue"
        ? ((initialValue as LiteralValue).references ?? [])
        : [])
        .map(reference => reference.value)
        .filter((value): value is SubFlowValue => value?.__typename === "SubFlowValue")

    const [subFlows, setSubFlows] = React.useState<SubFlowValue[]>(initialSubFlows)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const functionSuggestions = useFunctionSuggestions()

    const directMappingSuggestions = React.useMemo(() => {
        const inner = schema && "schema" in schema ? (schema as NodeSchema).schema : (schema as Schema | undefined)
        const items = (inner as { items?: Schema[] })?.items ?? []
        const seen = new Set<string>()
        return items.flatMap(item => item.suggestions ?? [])
            .filter((suggest): suggest is SubFlowValue => suggest.__typename === "SubFlowValue")
            .filter(suggest => {
                const key = suggest.functionDefinition?.id ?? suggest.signature ?? ""
                if (seen.has(key)) return false
                seen.add(key)
                return true
            })
    }, [schema])

    const referenceSuggestions = React.useMemo(
        () => (suggestions ?? []).filter(suggest => suggest.__typename !== "LiteralValue"),
        [suggestions]
    )

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 200)

    const keyOf = (value: SubFlowValue) => value.startingNodeId ?? value.functionDefinition?.id ?? ""
    const byKey = new Map(subFlows.map(value => [keyOf(value), value]))
    const tags: TagValue[] = subFlows.map(value => ({value: keyOf(value)}))

    const commit = (next: SubFlowValue[]) => {
        setSubFlows(next)

        if (next.length === 0) {
            formValidation?.setValue?.(null)
            onChangeDebounced(null)
            return
        }

        const references: InlineReferenceValue[] = next.map((value, index) => ({
            __typename: "InlineReferenceValue",
            signature: `sub_flow_${index}`,
            value
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
        <SuggestionDialogComponent suggestions={[...directMappingSuggestions, ...functionSuggestions]}
                                   open={dialogOpen}
                                   onOpenChange={setDialogOpen}
                                   onSuggestionSelect={value => {
                                       if (value?.__typename === "NodeFunction") {
                                           const nodeId = flowService.addNodeById(flowId, value)
                                           value = {__typename: "SubFlowValue", startingNodeId: nodeId}
                                       }
                                       if (value?.__typename !== "SubFlowValue") return
                                       commit([...subFlows, value])
                                   }}/>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <DataTypeInputValueComponent initialValue={initialValue}
                                     onChange={value => {
                                         formValidation?.setValue?.(value)
                                         onChangeDebounced(value)
                                     }}
                                     suggestions={suggestions}
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
                                  const value = byKey.get(matchedText)
                                  return value ? <NodeBadgeComponent value={value}/> : null
                              }
                          }
                      ]}
                      formValidation={{...formValidation, setValue: undefined}}
                      onChange={changed => {
                          const remaining = changed.map(tag => String(tag.value))
                          commit(subFlows.filter(value => remaining.includes(keyOf(value))))
                      }}
                      right={
                          <DataTypeInputControlsComponent suggestions={referenceSuggestions} onSelect={value => {
                              if (value?.__typename === "SubFlowValue") {
                                  commit([...subFlows, value])
                                  return
                              }
                              if (!value) {
                                  commit([])
                                  return
                              }
                              setSubFlows([])
                              formValidation?.setValue?.(value)
                              onChangeDebounced(value)
                          }}>
                              <Button paddingSize={"xxs"} onClick={() => setDialogOpen(true)}>
                                  <IconPlus size={13}/>
                              </Button>
                          </DataTypeInputControlsComponent>
                      }
                      rightType={"action"}>
                <TagInputValue/>
                <TagInputTrigger/>
            </TagInput>
        </DataTypeInputValueComponent>
    </>
}
