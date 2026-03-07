import type {DataTypeIdentifier, Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {replaceGenericKeysInType, resolveGenericKeys} from "@edition/flow/utils/generics";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

export const useReturnTypes = (
    flowId: Flow['id']
): Map<NodeFunction['id'], DataTypeIdentifier | null> => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const dataTypeService = useService(DatatypeService)

    return React.useMemo(() => {
        const flow = flowService.getById(flowId)
        return getReturnTypesForFlow(flow!, functionService, dataTypeService)
    }, [flowId, flowStore, functionStore, dataTypeService])

}

export function getReturnTypesForFlow(
    flow: Flow,
    functionService: FunctionService,
    dataTypeService: DatatypeService
): Map<NodeFunction['id'], DataTypeIdentifier | null> {
    const nodes = flow?.nodes?.nodes;
    const result = new Map<NodeFunction['id'], DataTypeIdentifier | null>();
    nodes?.forEach(node => {
        const values = node?.parameters?.nodes?.map(p => p?.value!) ?? [];
        const func = functionService.getById(node?.functionDefinition?.id!!);
        const genericTypeMap = resolveGenericKeys(func!, values, dataTypeService, functionService);
        const returnType = func?.returnType ? replaceGenericKeysInType(func.returnType, genericTypeMap) : null;
        if (node?.id) {
            result.set(node.id, returnType);
        }
    });
    return result;
}