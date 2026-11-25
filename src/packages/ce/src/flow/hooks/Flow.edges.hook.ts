import {Edge} from "@xyflow/react";
import React from "react";
import type {Flow, Namespace, NamespaceProject, NodeFunction, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {hashToColor, useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {FALLBACK_FUNCTION_PARAMETER_NAME} from "@core/util/fallback-translations";
import {subFlowParameters} from "@edition/flow/utils/Flow.subFlowParameters.util";
import {FlowBuilderEdgeDataProps} from "@edition/flow/components/builder/FlowBuilderEdgeComponent";
import {useFlowCompareStore} from "@edition/flow/hooks/Flow.compare.hook";
import {useFlowSchema} from "@edition/flow/hooks/Flow.schema.hook";
import {useInlinedReferenceNodes} from "@edition/flow/hooks/Flow.references.hook";

// @ts-ignore
export const useEdges = (flowId: Flow['id'], namespaceId?: Namespace['id'], projectId?: NamespaceProject['id']): Edge<FlowBuilderEdgeDataProps>[] => {

    const flowService = useService(FlowService);
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService);
    const functionStore = useStore(FunctionService)
    const flowToCompare = useFlowCompareStore(state => state.flow)
    const flowSchema = useFlowSchema(flowId, namespaceId, projectId)
    const inlinedNodes = useInlinedReferenceNodes(flowId, flowSchema)

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
        // the name is on every edge, the + goes onto the middle edge of its parameter afterwards
        const addableParameters = new Set<string>();
        const visited = new Set<string>();

        let idCounter = 0;

        const traverse = (
            node: NodeFunction,
            parentNode?: NodeFunction,
            isParameter = false
        ): string => {
            if (!node) return ""
            if (visited.has(node.id!)) return node.id!
            visited.add(node.id!)

            const inlinedReference = inlinedNodes.get(node.id!)

            if (!parentNode && !isParameter && !inlinedReference) {
                edges.push({
                    id: `trigger-${node.id}-next`,
                    source: flow.id as string,
                    target: node.id!,
                    data: {
                        color: "#ffffff",
                        type: 'default',
                        flowId: flowId
                    },
                    deletable: false,
                    selectable: false,
                });
            }

            if (inlinedReference) {
                const hostNode = flowService.getNodeById(flowId, inlinedReference.hostNodeId)
                const hostDefinition = functionService.getById(hostNode?.functionDefinition?.id!!)
                const hostParameterDefinition = hostDefinition?.parameterDefinitions?.nodes?.[inlinedReference.parameterIndex];
                const hostLabelKey = `${inlinedReference.hostNodeId}-${inlinedReference.parameterIndex}`
                const hostSchema = flowSchema?.find(signatureSchema => signatureSchema?.nodeId === inlinedReference.hostNodeId)?.parameters ?? []
                if (subFlowParameters(hostSchema, hostNode, hostDefinition)
                    .some(parameter => parameter.index === inlinedReference.parameterIndex && parameter.addable)) {
                    addableParameters.add(hostLabelKey)
                }

                edges.push({
                    id: `${node.id}-${inlinedReference.hostNodeId}-reference`,
                    source: node.id!,
                    target: inlinedReference.hostNodeId,
                    targetHandle: `param`,
                    deletable: false,
                    selectable: false,
                    animated: true,
                    label: hostParameterDefinition?.names!![0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME,
                    data: {
                        color: hashToColor(node.id!),
                        type: 'parameter',
                        flowId: flowId,
                        nodeId: inlinedReference.hostNodeId,
                        parameterIndex: inlinedReference.parameterIndex,
                        parameterSchema: hostSchema,
                        parameterName: hostParameterDefinition?.names!![0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME,
                        required: !hostParameterDefinition?.optional
                    }
                })

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

            const nodeSchema = flowSchema?.find(signatureSchema => signatureSchema?.nodeId === node.id)?.parameters ?? []
            const definition = functionService.getById(node.functionDefinition?.id!!)
            const nodeSubFlowParameters = subFlowParameters(nodeSchema, node, definition)

            node.parameters?.nodes?.forEach((param, index) => {
                const parameterValue = param?.value;
                const parameterDefinition = definition?.parameterDefinitions?.nodes?.[index];
                if (!parameterValue || parameterDefinition?.removedAt) return

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
                    if (nodeSubFlowParameters
                        .some(parameter => parameter.index === index && parameter.addable)) {
                        addableParameters.add(labelKey)
                    }

                    if (!subFlow.startingNodeId && subFlow.functionDefinition?.id) {
                        edges.push({
                            id: `${node.id}-${key}-next`,
                            source: `${node.id}-${key}`,
                            target: node.id!,
                            targetHandle: `param`,
                            deletable: false,
                            selectable: false,
                            animated: true,
                            label: parameterDefinition?.names!![0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME,
                            data: {
                                color: hashToColor(subFlow?.startingNodeId || subFlow.functionDefinition?.id || ""),
                                type: 'parameter',
                                flowId: flowId,
                                nodeId: node.id,
                                parameterIndex: index,
                                parameterSchema: nodeSchema,
                                parameterName: parameterDefinition?.names!![0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME,
                                required: !parameterDefinition?.optional
                            }
                        })

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
                            parentNodeId: parentNode?.id,
                            required: !parameterDefinition?.optional
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

            nodeSubFlowParameters
                .filter(parameter => parameter.addable && parameter.empty)
                .forEach(parameter => {
                    addableParameters.add(`${node.id}-${parameter.index}`)

                    edges.push({
                        id: `${node.id}-slot-${parameter.index}-next`,
                        source: `${node.id}-slot-${parameter.index}`,
                        target: node.id!,
                        targetHandle: parameter.alongFlow ? `param-flow` : `param`,
                        deletable: false,
                        selectable: false,
                        data: {
                            color: "#ffffff",
                            type: 'parameter',
                            alongFlow: parameter.alongFlow,
                            flowId: flowId,
                            nodeId: node.id,
                            parameterIndex: parameter.index,
                            parameterSchema: nodeSchema,
                            parameterName: definition?.parameterDefinitions?.nodes?.[parameter.index]?.names!![0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME,
                            required: !definition?.parameterDefinitions?.nodes?.[parameter.index]?.optional,
                            empty: true
                        }
                    })
                })

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

        const edgesPerParameter = new Map<string, number[]>()

        edges.forEach((edge, index) => {
            if (edge.data?.type !== 'parameter') return

            const parameter = `${edge.target}-${edge.data.parameterIndex}`
            edgesPerParameter.set(parameter, [...(edgesPerParameter.get(parameter) ?? []), index])
        })

        const withAddButton = new Set(Array.from(edgesPerParameter)
            .filter(([parameter]) => addableParameters.has(parameter))
            .map(([, indexes]) => indexes[Math.floor(indexes.length / 2)]))

        return edges.map((edge, index) => withAddButton.has(index)
            ? {...edge, data: {...edge.data!, addable: true}}
            : edge)
    }, [flowStore, flow?.editedAt, flow, flowToCompare, functionStore.length, inlinedNodes, flowSchema]);
};