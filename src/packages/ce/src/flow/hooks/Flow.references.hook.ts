import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {SignatureSchema} from "@code0-tech/triangulum";
import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {isSubFlowSchema} from "@edition/flow/utils/Flow.subFlowSchema.util";
import {referenceTargetIdsOfNode} from "@edition/flow/utils/Flow.referenceTargetsOfNode.util";
import {referenceTargetIdsOfValue} from "@edition/flow/utils/Flow.referenceTargetsOfValue.util";

export const useReferencedNodeIds = (flowId: Flow["id"]): Set<string> => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowStore, flowId]
    )

    return React.useMemo(() => new Set<string>(
        (flow?.nodes?.nodes ?? []).flatMap(node => referenceTargetIdsOfNode(node, flowId))
    ), [flow, flow?.editedAt, flowStore, flowId])
}

export interface InlinedReference {
    hostNodeId: NonNullable<NodeFunction["id"]>
    parameterIndex: number
}

export const useInlinedReferenceNodes = (flowId: Flow["id"], schema?: SignatureSchema[]): Map<string, InlinedReference> => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowStore, flowId]
    )

    return React.useMemo(() => {
        const inlined = new Map<string, InlinedReference>()
        const nodes = flow?.nodes?.nodes
        if (!nodes) return inlined

        const referencedBy = new Map<string, Map<NonNullable<NodeFunction["id"]>, number>>()
        const nodeById = new Map<string, NodeFunction>()

        nodes.forEach(node => {
            if (node?.id) nodeById.set(node.id, node)
        })

        nodes.forEach(node => {
            if (!node?.id) return

            node.parameters?.nodes?.forEach((parameter, parameterIndex) => {
                referenceTargetIdsOfValue(parameter?.value, flowId).forEach(target => {
                    const hosts = referencedBy.get(target) ?? new Map<NonNullable<NodeFunction["id"]>, number>()
                    if (!hosts.has(node.id!)) hosts.set(node.id!, parameterIndex)
                    referencedBy.set(target, hosts)
                })
            })
        })

        referencedBy.forEach((hosts, target) => {
            if (hosts.size !== 1 || target === flowId) return

            const [hostNodeId, parameterIndex] = Array.from(hosts)[0]
            const node = nodeById.get(target)

            if (!node?.nextNodeId) return

            const hostParameterSchema = schema
                ?.find(signatureSchema => signatureSchema?.nodeId === hostNodeId)
                ?.parameters?.[parameterIndex]?.schema

            if (!isSubFlowSchema(hostParameterSchema)) return

            const hasSubFlow = node.parameters?.nodes?.some(parameter => {
                const value = parameter?.value
                if (value?.__typename === "SubFlowValue") return true
                if (value?.__typename === "LiteralValue") {
                    return (value.references ?? []).some(reference => reference?.value?.__typename === "SubFlowValue")
                }
                return false
            })

            if (hasSubFlow) return

            inlined.set(target, {hostNodeId, parameterIndex})
        })

        inlined.forEach(({hostNodeId}, target) => {
            const walked = new Set<string>([target])
            let current = nodeById.get(target)?.nextNodeId

            while (current && current !== hostNodeId && !walked.has(current)) {
                walked.add(current)
                current = nodeById.get(current)?.nextNodeId
            }

            if (current === hostNodeId) return

            inlined.delete(target)
        })

        const hostNodeIds = new Set<string>(Array.from(inlined.values(), ({hostNodeId}) => hostNodeId))
        inlined.forEach((_, target) => {
            if (!hostNodeIds.has(target)) return
            inlined.delete(target)
        })

        return inlined
    }, [flow, flow?.editedAt, flowStore, flowId, schema])
}
