import React from "react";
import type {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {useValueSuggestions} from "./FunctionValueSuggestions.hook";
import {useReferenceSuggestions} from "./FunctionReferenceSuggestions.hook";
import {useNodeSuggestions} from "./FunctionNodeSuggestions.hook";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionSuggestion} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {useNodeTypeExtractionAction} from "@edition/flow/components/FlowWorkerProvider";

//TODO: deep type search
//TODO: calculate FUNCTION_COMBINATION deepness max 2

export const useSuggestions = (
    flowId: Flow['id'],
    nodeId?: NodeFunction['id'],
    parameterIndex?: number
): FunctionSuggestion[] => {

    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const {execute} = useNodeTypeExtractionAction()
    const [types, setTypes] = React.useState<any>(null);

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowId, flowStore, nodeId]
    )

    const functions = React.useMemo(
        () => functionService.values(),
        [functionStore]
    )

    const dataTypes = React.useMemo(
        () => dataTypeService.values(),
        [dataTypeStore]
    )

    React.useEffect(() => {
        if (!node) return
        const timeout = setTimeout(() => {
            execute({
                node: node,
                dataTypes: dataTypes,
                functions: functions
            }).then(value => {
                setTypes(value)
            })
        }, 200);

        return () => clearTimeout(timeout);
    }, [node, functions, dataTypes])

    const valueSuggestions = useValueSuggestions(types?.parameters?.[parameterIndex ?? 0])
    const refObjectSuggestions = useReferenceSuggestions(flowId, nodeId, parameterIndex)
    const functionSuggestions = (node && typeof parameterIndex === "number") || (!node && typeof parameterIndex != "number") ? useNodeSuggestions(types?.parameters?.[parameterIndex ?? 0]) : []

    return React.useMemo(() => {
        return [
            ...valueSuggestions,
            ...refObjectSuggestions,
            ...functionSuggestions
        ].sort()
    }, [valueSuggestions, refObjectSuggestions, functionSuggestions])
}
