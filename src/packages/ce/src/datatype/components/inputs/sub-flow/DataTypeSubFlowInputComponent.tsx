import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import React from "react";
import {useDebouncedCallback} from "use-debounce";
import {InputDescription, InputLabel, Text, useService} from "@code0-tech/pictor";
import lodash from "lodash"
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {Flow, LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useParams} from "next/navigation";


export type DataTypeSubFlowInputComponentProps = DataTypeInputComponentProps


export const DataTypeSubFlowInputComponent: React.FC<DataTypeSubFlowInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const params = useParams()
    const flowService = useService(FlowService)

    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const defaultValue: number = React.useMemo(() => suggestions?.findIndex(suggest => {
        return initialValue && lodash.isMatch(initialValue, suggest)
    }), [suggestions])!

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const result = useFunctionSuggestions()

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | ReferenceValue | NodeFunction | null) => {
        onChange?.(value ?? null)
    }, 200)

    return React.useMemo(() => <>
        <SuggestionDialogComponent suggestions={[...suggestions!, ...result]}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={value => {
                                       if (value?.__typename === "NodeFunction") {
                                           const nodeId = flowService.addNodeById(flowId, value)
                                           value = {
                                               __typename: "SubFlowValue",
                                               startingNodeId: nodeId
                                           }
                                       }
                                       formValidation?.setValue?.(value ?? null)
                                       onChangeDebounced(value as NodeFunction)
                                   }}
                                   onOpenChange={setSuggestionDialogOpen}/>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <DataTypeInputValueComponent inside
                                     showSuggestions={false}
                                     wrapperComponent={{
                                         onClick: () => {
                                             setSuggestionDialogOpen(true)
                                         }
                                     }}
                                     initialValue={initialValue}
                                     onChange={(value) => {
                                         if (value?.__typename === "NodeFunction") {
                                             const nodeId = flowService.addNodeById(flowId, value)
                                             value = {
                                                 __typename: "SubFlowValue",
                                                 startingNodeId: nodeId
                                             }
                                         }
                                         formValidation?.setValue?.(value ?? null)
                                         onChangeDebounced(value ?? null)
                                     }}
                                     suggestions={suggestions}
                                     formValidation={formValidation}>
            <Text>Select next node</Text>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue, suggestionDialogOpen])
}