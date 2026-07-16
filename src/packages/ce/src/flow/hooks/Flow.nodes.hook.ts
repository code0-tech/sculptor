import {Node} from "@xyflow/react";
import type {Flow, Namespace, NamespaceProject, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {hashToColor, useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {FunctionNodeComponentProps} from "@edition/function/components/nodes/FunctionNodeComponent";
import {useFlowSchema} from "@edition/flow/hooks/Flow.schema.hook";
import {useFlowCompareStore} from "@edition/flow/hooks/Flow.compare.hook";

export const useFlowNodes = (flowId: Flow["id"], namespaceId?: Namespace["id"], projectId?: NamespaceProject["id"]): Node<FunctionNodeComponentProps>[] => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowToCompare = useFlowCompareStore(state => state.flow)

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowId, namespaceId, projectId, flowStore, flowService]
    )

    const flowSchema = useFlowSchema(flowId, namespaceId, projectId)

    return React.useMemo<Node<FunctionNodeComponentProps>[]>(() => {
        if (!flow) return []
        if (functionStore.length <= 0) return []

        const nodes: Node<FunctionNodeComponentProps>[] = []
        const visited = new Set<string>()

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
                schema: flowSchema?.find(signatureSchema => !signatureSchema.nodeId)?.parameters ?? []
            },
        })

        const traverse = (
            node: NodeFunction,
            parentGroup?: string
        ) => {

            globalIndex++
            if (!node?.id) return

            const functionDefinition = functionService.getById(node.functionDefinition?.id)
            const nodeId = node.id

            if (!visited.has(nodeId)) {
                visited.add(nodeId)

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
                        index: globalIndex,
                        color: hashToColor(nodeId),
                        schema: flowSchema?.find(signatureSchema => signatureSchema.nodeId === node.id)?.parameters ?? []
                    },
                })
            }

            node.parameters?.nodes?.forEach((param) => {
                const value = param?.value
                if (!value || value.__typename !== "SubFlowValue") return

                if (value.functionDefinition?.id) {
                    nodes.push({
                        id: `${nodeId}-${param.id}`,
                        type: functionDefinition && "design" in functionDefinition ? functionDefinition?.design as string : "square",
                        position: {x: 0, y: 0},
                        draggable: false,
                        parentId: parentGroup,
                        extent: parentGroup ? "parent" : undefined,
                        data: {
                            isParameter: true,
                            parameterId: param?.id,
                            parentNodeId: nodeId,
                            index: globalIndex,
                            functionId: value.functionDefinition?.id,
                            flowId: flowId,
                            color: hashToColor(value?.startingNodeId ?? value?.functionDefinition?.id ?? ""),
                            schema: []
                        },
                    })
                    return
                }

                const groupId = `${nodeId}-group-${groupCounter++}`

                if (!visited.has(groupId)) {
                    visited.add(groupId)

                    nodes.push({
                        id: groupId,
                        type: "group",
                        position: {x: 0, y: 0},
                        draggable: false,
                        parentId: parentGroup,
                        extent: parentGroup ? "parent" : undefined,
                        data: {
                            isParameter: true,
                            nodeId: nodeId,
                            flowId: flowId,
                            color: hashToColor(value?.startingNodeId ?? ""),
                            schema: []
                        },
                    })
                }

                const child = flowService.getNodeById(flowId, value.startingNodeId)
                if (child) traverse(child, groupId)
            })

            if (node.nextNodeId) {
                const next = flowService.getNodeById(flow.id, node.nextNodeId);
                if (next) traverse(next, parentGroup);
            }
        };

        if (flow.startingNodeId) {
            const start = flowService.getNodeById(flow.id, flow.startingNodeId);
            if (start) traverse(start);
        }

        return nodes
    }, [flowStore, flow?.editedAt, flow, flowToCompare, functionStore.length, flowSchema, flowId])
}