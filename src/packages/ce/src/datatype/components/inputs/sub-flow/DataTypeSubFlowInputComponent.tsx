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
import {exactSuggestions} from "@edition/datatype/utils/DataType.exactSuggestions.util";
import {ownSuggestionCertainties} from "@edition/datatype/utils/DataType.suggestionCertainties.util";


export type DataTypeSubFlowInputComponentProps = DataTypeInputComponentProps


export const DataTypeSubFlowInputComponent: React.FC<DataTypeSubFlowInputComponentProps> = (props) => {

    const {schema, formValidation, title, initialValue, description, suggestions, onChange} = props

    const params = useParams()
    const flowService = useService(FlowService)

    const flowIndex = Number(params.flowId) || 1
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const exactMatches = React.useMemo(
        () => exactSuggestions(suggestions ?? [], ownSuggestionCertainties(schema)),
        [schema, suggestions]
    )

    const hasExactMatches = exactMatches.length > 0

    const defaultValue: number = React.useMemo(() => exactMatches.findIndex(suggest => {
        return initialValue && lodash.isMatch(initialValue, suggest)
    }), [exactMatches])!

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const [customLogicDialogOpen, setCustomLogicDialogOpen] = React.useState(false)
    const functionSuggestions = useFunctionSuggestions()

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value ?? null)
    }, 200)

    return <>
        <SuggestionDialogComponent suggestions={exactMatches}
                                   flowId={flowId}
                                   nodeId={props.nodeId}
                                   parameterIndex={props.parameterIndex}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={value => {
                                       formValidation?.setValue?.(value ?? null)
                                       onChangeDebounced(value ?? null)
                                   }}
                                   onOpenChange={setSuggestionDialogOpen}/>
        <SuggestionDialogComponent suggestions={functionSuggestions}
                                   flowId={flowId}
                                   nodeId={props.nodeId}
                                   parameterIndex={props.parameterIndex}
                                   open={customLogicDialogOpen}
                                   onBackSelect={hasExactMatches ? () => setSuggestionDialogOpen(true) : undefined}
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
                                         if (hasExactMatches) setSuggestionDialogOpen(true)
                                         else setCustomLogicDialogOpen(true)
                                     }}
                                     initialValue={initialValue}
                                     onChange={(value) => {
                                         formValidation?.setValue?.(value ?? null)
                                         onChangeDebounced(value ?? null)
                                     }}
                                     suggestions={exactMatches}
                                     nodeId={props.nodeId}
                                     parameterIndex={props.parameterIndex}
                                     onCustomLogicGroupSelect={() => setCustomLogicDialogOpen(true)}
                                     formValidation={formValidation}>
            <Text>Select next node</Text>
        </DataTypeInputValueComponent>
    </>
}