import {Node} from "@xyflow/react";
import type {Flow, Namespace, NamespaceProject, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {hashToColor, useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionNodeComponentProps} from "@edition/function/components/nodes/FunctionNodeComponent";
import {DataTypeVariant, getTypesFromFunction, getTypesFromNode, getTypeVariant} from "@code0-tech/triangulum";

export const useFlowNodes = (flowId: Flow["id"], namespaceId?: Namespace["id"], projectId?: NamespaceProject["id"]): Node<FunctionNodeComponentProps>[] => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)

    const flow = React.useMemo(() => flowService.getById(flowId, {namespaceId, projectId}), [flowId, flowStore]);

    return React.useMemo(() => {
        if (!flow) return []
        if (functionStore.length <= 0) return []
        if (dataTypeStore.length <= 0) return []

        const nodes: Node<FunctionNodeComponentProps>[] = [];
        const visited = new Set<string>();

        let groupCounter = 0;
        let globalIndex = 0;

        // Trigger node (ID == flow.id -> edge compatible)
        nodes.push({
            id: `${flow.id}`,
            type: "trigger",
            position: {x: 0, y: 0},
            draggable: false,
            data: {
                flowId: flowId,
                nodeId: undefined,
                color: hashToColor(flowId!),
            },
        });

        const traverse = (
            node: NodeFunction,
            isParameter = false,
            parentId?: NodeFunction['id'],
            parentGroup?: string
        ) => {
            if (!node?.id) return;

            const functionDefinition = functionService.getById(node.functionDefinition?.id)
            const nodeId = node.id;

            if (!visited.has(nodeId)) {
                visited.add(nodeId);

                nodes.push({
                    id: nodeId,
                    type: functionDefinition && "design" in functionDefinition ? functionDefinition?.design as string : "default",
                    position: {x: 0, y: 0},
                    draggable: false,
                    parentId: parentGroup,
                    extent: parentGroup ? "parent" : undefined,
                    data: {
                        nodeId: nodeId,
                        isParameter: isParameter,
                        flowId: flowId,
                        parentNodeId: isParameter ? parentId : undefined,
                        index: ++globalIndex,
                        color: hashToColor(nodeId),
                    },
                });
            }

            const types = getTypesFromFunction(functionDefinition!);

            node.parameters?.nodes?.forEach((param, index) => {
                const value = param?.value;
                if (!value || value.__typename !== "NodeFunctionIdWrapper") return;
                
                const variant = getTypeVariant(types.parameters[index], dataTypeService.values())[0].variant;

                if (variant === DataTypeVariant.NODE) {
                    const groupId = `${nodeId}-group-${groupCounter++}`;

                    if (!visited.has(groupId)) {
                        visited.add(groupId);

                        nodes.push({
                            id: groupId,
                            type: "group",
                            position: {x: 0, y: 0},
                            draggable: false,
                            parentId: parentGroup,
                            extent: parentGroup ? "parent" : undefined,
                            data: {
                                isParameter: true,
                                parentNodeId: nodeId,
                                nodeId: nodeId,
                                flowId: flowId,
                                color: hashToColor(value?.id ?? ""),
                            },
                        });
                    }

                    const child = flowService.getNodeById(flowId, value.id);
                    if (child) traverse(child, false, undefined, groupId);
                } else {
                    const child = flowService.getNodeById(flowId, value.id);
                    if (child) traverse(child, true, nodeId, parentGroup);
                }
            });

            if (node.nextNodeId) {
                const next = flowService.getNodeById(flow.id, node.nextNodeId);
                if (next) traverse(next, false, undefined, parentGroup);
            }
        };

        if (flow.startingNodeId) {
            const start = flowService.getNodeById(flow.id, flow.startingNodeId);
            if (start) traverse(start);
        }

        return nodes;
    }, [flow, flowStore, functionStore, dataTypeStore]);
};