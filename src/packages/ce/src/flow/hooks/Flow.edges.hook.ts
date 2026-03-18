import {Edge} from "@xyflow/react";
import React from "react";
import type {Flow, Namespace, NamespaceProject, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {hashToColor, useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {DataTypeVariant, getTypesFromNode, getTypeVariant} from "@code0-tech/triangulum";

// @ts-ignore
export const useEdges = (flowId: Flow['id'], namespaceId?: Namespace['id'], projectId?: NamespaceProject['id']): Edge<DFlowEdgeDataProps>[] => {

    const flowService = useService(FlowService);
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService);
    const functionStore = useStore(FunctionService)
    const dataTypeService = useService(DatatypeService);
    const dataTypeStore = useStore(DatatypeService)

    const flow = React.useMemo(() => flowService.getById(flowId, {namespaceId, projectId}), [flowId, flowStore])

    return React.useMemo(() => {
        if (!flow) return []
        if (functionStore.length <= 0) return []
        if (dataTypeStore.length <= 0) return []

        // @ts-ignore
        const edges: Edge<DFlowEdgeDataProps>[] = []

        const groupsWithValue = new Map<string, string[]>();

        let idCounter = 0;

        const traverse = (
            node: NodeFunction,
            parentNode?: NodeFunction,
            isParameter = false
        ): string => {
            if (!node) return ""

            if (node.id == flow.startingNodeId) {
                edges.push({
                    id: `trigger-${node.id}-next`,
                    source: flow.id as string,
                    target: node.id!,
                    data: {
                        color: "#ffffff",
                        type: 'default',
                        flowId: flowId,
                        parentNodeId: parentNode?.id
                    },
                    deletable: false,
                    selectable: false,
                });
            }

            if (parentNode?.id && !isParameter) {
                const startGroups = groupsWithValue.get(parentNode.id) ?? [];

                if (startGroups.length > 0) {
                    startGroups.forEach((gId, idx) => edges.push({
                        id: `${gId}-${node.id}-next-${idx}`,
                        source: gId,
                        target: node.id!,
                        data: {
                            color: "#ffffff",
                            type: 'default',
                            flowId: flowId,
                            parentNodeId: parentNode?.id
                        },
                        deletable: false,
                        selectable: false,
                    }));
                } else {
                    edges.push({
                        id: `${parentNode.id}-${node.id}-next`,
                        source: parentNode.id,
                        target: node.id!,
                        data: {
                            color: "#ffffff",
                            type: 'default',
                            flowId: flowId,
                            parentNodeId: parentNode.id
                        },
                        deletable: false,
                        selectable: false,
                    });
                }
            }

            const types = getTypesFromNode(node, functionService.values(), dataTypeService.values());

            node.parameters?.nodes?.forEach((param, index) => {
                const parameterValue = param?.value;
                const parameterDefinition = functionService.getById(node.functionDefinition?.id!!)?.parameterDefinitions?.nodes?.find(p => p?.id === param?.parameterDefinition?.id);
                const variant = getTypeVariant(types.parameters[index], dataTypeService.values());
                if (!parameterValue) return

                //@ts-ignore
                if (variant === DataTypeVariant.NODE) {
                    if (parameterValue && parameterValue.__typename === "NodeFunctionIdWrapper") {

                        const groupId = `${node.id}-group-${idCounter++}`;

                        edges.push({
                            id: `${node.id}-${groupId}-param-${index}`,
                            source: node.id!,
                            target: groupId,
                            deletable: false,
                            selectable: false,
                            animated: true,
                            label: parameterDefinition?.names!![0]?.content ?? index,
                            data: {
                                color: hashToColor(parameterValue?.id || ""),
                                type: 'group',
                                flowId: flowId,
                                parentNodeId: parentNode?.id
                            },
                        });

                        (groupsWithValue.get(node.id!) ?? (groupsWithValue.set(node.id!, []), groupsWithValue.get(node.id!)!)).push(groupId);

                        traverse(
                            flowService.getNodeById(flowId, parameterValue.id)!,
                            node,
                            true
                        );
                    }
                } else if (parameterValue && parameterValue.__typename === "NodeFunctionIdWrapper") {
                    const subFnId = traverse(
                        flowService.getNodeById(flowId, parameterValue.id)!,
                        node,
                        true
                    );

                    edges.push({
                        id: `${subFnId}-${node.id}-param-${index}`,
                        source: subFnId,
                        target: node.id!,
                        targetHandle: `param-${index}`,
                        animated: true,
                        deletable: false,
                        selectable: false,
                        data: {
                            color: hashToColor(parameterValue?.id || ""),
                            type: 'parameter',
                            flowId: flowId,
                            parentNodeId: parentNode?.id
                        },
                    });
                }
            });

            if (node.nextNodeId) {
                traverse(flowService.getNodeById(flow.id!!, node.nextNodeId!!)!!, node);
            }

            return node.id!;
        };

        if (flow.startingNodeId) {
            traverse(flowService.getNodeById(flow.id!!, flow.startingNodeId!!)!!, undefined, false);
        }

        return edges
    }, [flow, flowStore, functionStore, dataTypeStore]);
};