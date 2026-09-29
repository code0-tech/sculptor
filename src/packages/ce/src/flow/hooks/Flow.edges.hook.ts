import {Edge} from "@xyflow/react";
import React from "react";
import type {Flow, Namespace, NamespaceProject, NodeFunction, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {hashToColor, useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {FALLBACK_FUNCTION_PARAMETER_NAME} from "@core/util/fallback-translations";
import {FlowBuilderEdgeDataProps} from "@edition/flow/components/builder/FlowBuilderEdgeComponent";
import {useFlowCompareStore} from "@edition/flow/hooks/Flow.compare.hook";
import {useInlinedReferenceNodes} from "@edition/flow/hooks/Flow.references.hook";

// @ts-ignore
export const useEdges = (flowId: Flow['id'], namespaceId?: Namespace['id'], projectId?: NamespaceProject['id']): Edge<FlowBuilderEdgeDataProps>[] => {

    const flowService = useService(FlowService);
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService);
    const functionStore = useStore(FunctionService)
    const flowToCompare = useFlowCompareStore(state => state.flow)
    const inlinedNodes = useInlinedReferenceNodes(flowId)

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowId, namespaceId, projectId, flowStore, flowService]
    )

    return React.useMemo(() => {
        if (!flow) return []
        if (functionStore.length <= 0) return []

        // @ts-ignore
        const edges: Edge<FlowBuilderEdgeDataProps>[] = []

        const groupsWithValue = new Map<string, string[]>();
        const labeledParameters = new Set<string>();

        let idCounter = 0;

        let firstChainNodeId = flow.startingNodeId
        while (firstChainNodeId && inlinedNodes.has(firstChainNodeId)) {
            firstChainNodeId = flowService.getNodeById(flowId, firstChainNodeId)?.nextNodeId ?? undefined
        }

        const traverse = (
            node: NodeFunction,
            parentNode?: NodeFunction,
            isParameter = false
        ): string => {
            if (!node) return ""

            const inlinedReference = inlinedNodes.get(node.id!)

            if (node.id == firstChainNodeId) {
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

            if (inlinedReference) {
                const hostNode = flowService.getNodeById(flowId, inlinedReference.hostNodeId)
                const hostParameterDefinition = functionService.getById(hostNode?.functionDefinition?.id!!)?.parameterDefinitions?.nodes?.[inlinedReference.parameterIndex];
                const hostLabelKey = `${inlinedReference.hostNodeId}-${inlinedReference.parameterIndex}`

                edges.push({
                    id: `${node.id}-${inlinedReference.hostNodeId}-reference`,
                    source: node.id!,
                    target: inlinedReference.hostNodeId,
                    targetHandle: `param`,
                    deletable: false,
                    selectable: false,
                    animated: true,
                    label: labeledParameters.has(hostLabelKey) ? undefined : hostParameterDefinition?.names!![0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME,
                    data: {
                        color: hashToColor(node.id!),
                        type: 'parameter',
                        flowId: flowId
                    }
                })

                labeledParameters.add(hostLabelKey)
            }

            if (parentNode?.id && !isParameter && !inlinedReference) {
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

            node.parameters?.nodes?.forEach((param, index) => {
                const parameterValue = param?.value;
                const parameterDefinition = functionService.getById(node.functionDefinition?.id!!)?.parameterDefinitions?.nodes?.[index];
                if (!parameterValue) return

                const subFlowValues: { subFlow: SubFlowValue, key: string }[] =
                    parameterValue.__typename === "SubFlowValue"
                        ? [{subFlow: parameterValue, key: `${index}`}]
                        : parameterValue.__typename === "LiteralValue"
                            ? (parameterValue.references ?? [])
                                .filter(reference => reference?.value?.__typename === "SubFlowValue")
                                .map((reference, referenceIndex) => ({
                                    subFlow: reference!.value as SubFlowValue,
                                    key: `${index}-${reference?.signature ?? referenceIndex}`
                                }))
                            : []

                subFlowValues.forEach(({subFlow, key}) => {

                    const labelKey = `${node.id}-${index}`

                    if (!subFlow.startingNodeId && subFlow.functionDefinition?.id) {
                        edges.push({
                            id: `${node.id}-${key}-next`,
                            source: `${node.id}-${key}`,
                            target: node.id!,
                            targetHandle: `param`,
                            deletable: false,
                            selectable: false,
                            animated: true,
                            label: labeledParameters.has(labelKey) ? undefined : parameterDefinition?.names!![0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME,
                            data: {
                                color: hashToColor(subFlow?.startingNodeId || subFlow.functionDefinition?.id || ""),
                                type: 'parameter',
                                flowId: flowId
                            }
                        })

                        labeledParameters.add(labelKey)
                        return
                    }

                    const groupId = `${node.id}-group-${idCounter++}`;

                    edges.push({
                        id: `${node.id}-${groupId}-param-${index}`,
                        source: node.id!,
                        target: groupId,
                        deletable: false,
                        selectable: false,
                        animated: true,
                        label: parameterDefinition?.names!![0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME,
                        data: {
                            color: hashToColor(subFlow?.startingNodeId || subFlow.functionDefinition?.id || ""),
                            type: 'group',
                            flowId: flowId,
                            parentNodeId: parentNode?.id
                        },
                    });

                    (groupsWithValue.get(node.id!) ?? (groupsWithValue.set(node.id!, []), groupsWithValue.get(node.id!)!)).push(groupId);

                    if (subFlow.startingNodeId) {
                        traverse(
                            flowService.getNodeById(flowId, subFlow.startingNodeId)!,
                            node,
                            true
                        );
                    }
                })
            });

            if (node.nextNodeId) {
                traverse(
                    flowService.getNodeById(flow.id!!, node.nextNodeId!!)!!,
                    inlinedReference ? parentNode : node,
                    inlinedReference ? isParameter : false
                );
            }

            return node.id!;
        };

        if (flow.startingNodeId) {
            traverse(flowService.getNodeById(flow.id!!, flow.startingNodeId!!)!!, undefined, false);
        }

        return edges
    }, [flowStore, flow?.editedAt, flow, flowToCompare, functionStore.length, inlinedNodes]);
};