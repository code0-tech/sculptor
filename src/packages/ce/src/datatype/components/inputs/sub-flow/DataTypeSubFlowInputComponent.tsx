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

    const flowIndex = Number(params.flowId) || 1
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const defaultValue: number = React.useMemo(() => suggestions?.findIndex(suggest => {
        return initialValue && lodash.isMatch(initialValue, suggest)
    }), [suggestions])!

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const [customLogicDialogOpen, setCustomLogicDialogOpen] = React.useState(false)
    const functionSuggestions = useFunctionSuggestions()

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value ?? null)
    }, 200)

    const referenceSuggestions = React.useMemo(
        () => (suggestions ?? []).filter(suggest => suggest.__typename !== "LiteralValue"),
        [suggestions]
    )

    return <>
        <SuggestionDialogComponent suggestions={suggestions}
                                   flowId={flowId}
                                   nodeId={props.nodeId}
                                   parameterIndex={props.parameterIndex}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={value => {
                                       formValidation?.setValue?.(value ?? null)
                                       onChangeDebounced(value ?? null)
                                   }}
                                   onCustomLogicGroupSelect={() => setCustomLogicDialogOpen(true)}
                                   onOpenChange={setSuggestionDialogOpen}/>
        <SuggestionDialogComponent suggestions={functionSuggestions}
                                   flowId={flowId}
                                   nodeId={props.nodeId}
                                   parameterIndex={props.parameterIndex}
                                   open={customLogicDialogOpen}
                                   onBackSelect={() => setSuggestionDialogOpen(true)}
                                   onSuggestionSelect={value => {
                                       if (value?.__typename === "NodeFunction") {
                                           const nodeId = flowService.addNodeById(flowId, value)
                                           value = {
                                               __typename: "SubFlowValue",
                                               startingNodeId: nodeId
                                           }
                                       }
                                       formValidation?.setValue?.(value ?? null)
                                       onChangeDebounced(value as SubFlowValue)
                                   }}
                                   onOpenChange={setCustomLogicDialogOpen}/>
        {title && <InputLabel>{title}</InputLabel>}
        {description && <InputDescription>{description}</InputDescription>}
        <DataTypeInputValueComponent inside
                                     onClick={() => {
                                         setSuggestionDialogOpen(true)
                                     }}
                                     initialValue={initialValue}
                                     onChange={(value) => {
                                         formValidation?.setValue?.(value ?? null)
                                         onChangeDebounced(value ?? null)
                                     }}
                                     suggestions={referenceSuggestions}
                                     nodeId={props.nodeId}
                                     parameterIndex={props.parameterIndex}
                                     onCustomLogicGroupSelect={() => setCustomLogicDialogOpen(true)}
                                     formValidation={formValidation}>
            <Text>Select next node</Text>
        </DataTypeInputValueComponent>
    </>
}