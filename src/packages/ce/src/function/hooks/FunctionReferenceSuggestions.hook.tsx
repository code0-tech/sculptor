import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import React from "react";
import {useReferenceSuggestionsAction} from "@edition/flow/components/FlowWorkerProvider";

export const useReferenceSuggestions = (
    flowId: Flow['id'],
    nodeId?: NodeFunction['id'],
    parameterIndex?: number,
): FunctionSuggestion[] => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const {execute} = useReferenceSuggestionsAction()
    const [suggestions, setSuggestions] = React.useState<any[]>([])

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowId, flowStore]
    )
    const functions = React.useMemo(() => functionService.values(), [functionStore]);
    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {
        if (typeof parameterIndex != "number" || !flow || !nodeId) return;

        const timeout = setTimeout(() => {
            execute({
                flow,
                nodeId,
                parameterIndex,
                functions,
                dataTypes
            }).then(value => {
                setSuggestions(value as any[])
            })
        }, 200);

        return () => clearTimeout(timeout);
    }, [flow?.editedAt, nodeId, parameterIndex, functions, dataTypes])

    return React.useMemo(() => suggestions.map(suggestion => {

        return {
            path: [],
            type: FunctionSuggestionType.REF_OBJECT,
            displayText: [`${suggestion.referencePath?.map((path: any) => path.path).join(".") ?? ""}`],
            value: suggestion,
        }
    }), [suggestions]);
}
