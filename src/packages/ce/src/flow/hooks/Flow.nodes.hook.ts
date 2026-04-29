import {Node} from "@xyflow/react";
import type {Flow, Namespace, NamespaceProject, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {hashToColor, useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {FunctionNodeComponentProps} from "@edition/function/components/nodes/FunctionNodeComponent";

export const useFlowNodes = (flowId: Flow["id"], namespaceId?: Namespace["id"], projectId?: NamespaceProject["id"]): Node<FunctionNodeComponentProps>[] => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowId, flowStore]
    )

    return React.useMemo(() => {
        if (!flow) return []
        if (functionStore.length <= 0) return []

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
                        flowId: flowId,
                        index: ++globalIndex,
                        color: hashToColor(nodeId),
                    },
                });
            }

            node.parameters?.nodes?.forEach((param) => {
                const value = param?.value;
                if (!value || value.__typename !== "NodeFunctionIdWrapper") return;

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
                if (child) traverse(child, groupId);
            });

            if (node.nextNodeId) {
                const next = flowService.getNodeById(flow.id, node.nextNodeId);
                if (next) traverse(next, parentGroup);
            }
        };

        if (flow.startingNodeId) {
            const start = flowService.getNodeById(flow.id, flow.startingNodeId);
            if (start) traverse(start);
        }

        return nodes;
    }, [flow, flowStore, functionStore]);
};