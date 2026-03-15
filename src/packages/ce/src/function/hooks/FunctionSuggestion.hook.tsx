import React from "react";
import type {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {useValueSuggestions} from "./FunctionValueSuggestions.hook";
import {useReferenceSuggestions} from "./FunctionReferenceSuggestions.hook";
import {useNodeSuggestions} from "./FunctionNodeSuggestions.hook";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionSuggestion} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {getTypesFromNode} from "@code0-tech/triangulum";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

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

    const node = React.useMemo(() => (flowService.getNodeById(flowId, nodeId)), [flowId, flowStore, nodeId])
    const types = React.useMemo(
        () => {
            if (!node) return null
            return getTypesFromNode(node, functionService.values(), dataTypeService.values())
        },
        [node, functionStore, dataTypeStore]
    )

    const valueSuggestions = useValueSuggestions(types?.parameters?.[parameterIndex ?? 0])
    const refObjectSuggestions = useReferenceSuggestions(flowId, nodeId, types?.parameters?.[parameterIndex ?? 0])
    const functionSuggestions = useNodeSuggestions(types?.parameters?.[parameterIndex ?? 0])

    return React.useMemo(() => {
        return [
            ...valueSuggestions,
            ...refObjectSuggestions,
            ...functionSuggestions
        ].sort()
    }, [flowId, nodeId, parameterIndex, refObjectSuggestions, functionSuggestions])
}
