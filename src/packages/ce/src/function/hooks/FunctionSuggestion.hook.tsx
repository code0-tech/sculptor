import React from "react";
import type {Flow, NodeFunction, NodeParameter,} from "@code0-tech/sagittarius-graphql-types";
import {useValueSuggestions} from "./FunctionValueSuggestions.hook";
import {useReferenceSuggestions} from "./FunctionReferenceSuggestions.hook";
import {useFunctionSuggestions} from "./FunctionNodeSuggestions.hook";
import {useDataTypeSuggestions} from "./FunctionDataTypeSuggestions.hook";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionSuggestion} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";

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

    const node = React.useMemo(() => (flowService.getNodeById(flowId, nodeId)), [flowId, flowStore, nodeId])
    const functionDefinition = React.useMemo(() => (node?.functionDefinition?.id ? functionService.getById(node.functionDefinition.id) : undefined), [functionStore, node?.functionDefinition?.id])
    const parameterDefinition = React.useMemo(() => (functionDefinition?.parameterDefinitions?.find(definition => {
        const parameterDefinitionId = node?.parameters?.nodes?.[parameterIndex ?? 0]?.parameterDefinition?.id
        return definition.id === parameterDefinitionId
    })), [functionDefinition?.parameterDefinitions, node])

    const dataTypeIdentifier = parameterDefinition?.dataTypeIdentifier!
    const genericKeys = functionDefinition?.genericKeys ?? []

    const valueSuggestions = useValueSuggestions(dataTypeIdentifier)
    const dataTypeSuggestions = useDataTypeSuggestions(dataTypeIdentifier)
    const refObjectSuggestions = useReferenceSuggestions(flowId, nodeId, dataTypeIdentifier, genericKeys)
    const functionSuggestions = useFunctionSuggestions(dataTypeIdentifier, genericKeys)

    return React.useMemo(() => {
        return [
            ...valueSuggestions,
            ...dataTypeSuggestions,
            ...refObjectSuggestions,
            ...functionSuggestions
        ].sort()
    }, [flowId, nodeId, parameterIndex, dataTypeSuggestions, refObjectSuggestions, functionSuggestions])
}
