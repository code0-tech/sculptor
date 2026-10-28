import {create} from "zustand"
import React from "react"
import {useParams} from "next/navigation"
import {useService, useStore} from "@code0-tech/pictor"
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types"
import {FlowService} from "@edition/flow/services/Flow.service"
import {useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook"

export type FlowExecutionNodeStatus = "idle" | "running" | "success" | "error"

export interface FlowExecutionStep {
    start: number
    end: number
    error: boolean
}

export interface FlowExecutionNodeTimeline {
    nodeId: string
    steps: FlowExecutionStep[]
}

export interface FlowExecutionTimeline {
    duration: number
    hold: number
    nodes: FlowExecutionNodeTimeline[]
}

interface FlowExecutionAnimationState {
    active: boolean
    statuses: Record<string, FlowExecutionNodeStatus>
    setStatuses: (statuses: Record<string, FlowExecutionNodeStatus>) => void
    reset: () => void
}

export const useFlowExecutionAnimationStore = create<FlowExecutionAnimationState>((setState) => ({
    active: false,
    statuses: {},
    setStatuses: (statuses) => setState((state) => {
        const nodeIds = Object.keys(statuses)
        const isUnchanged = state.active
            && nodeIds.length === Object.keys(state.statuses).length
            && nodeIds.every(nodeId => state.statuses[nodeId] === statuses[nodeId])

        return isUnchanged ? state : {active: true, statuses}
    }),
    reset: () => setState((state) => state.active ? {active: false, statuses: {}} : state),
}))

export const useFlowExecutionNodeStatus = (nodeId: string): FlowExecutionNodeStatus | undefined =>
    useFlowExecutionAnimationStore(state => state.active ? state.statuses[nodeId] ?? "idle" : undefined)

export const useFlowExecutionTimeline = (): FlowExecutionTimeline => {

    const params = useParams()
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const selectedExecutionId = useFlowExecutionStore(state => state.selectedExecutionId)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`
    const holdDuration = 10000
    const shortestPlayback = 1500
    const longestPlayback = 15000

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowStore, flowService, flowId, namespaceId, projectId]
    )

    return React.useMemo(() => {

        const result = flow?.executionResults?.nodes?.find(node => node?.id === selectedExecutionId)
        if (!result) return {duration: 0, hold: holdDuration, nodes: []}

        const executionStart = Number(result.startedAt ?? 0)
        const recordedDuration = Math.max(Number(result.finishedAt ?? 0) - executionStart, 1)
        const scale = Math.min(Math.max(recordedDuration / 1000, shortestPlayback), longestPlayback) / recordedDuration

        const nodeResults = [...(result.nodeResults?.nodes ?? [])]
            .filter(nodeResult => !!nodeResult?.nodeFunction?.id)
            .sort((a, b) => Number(a?.startedAt) - Number(b?.startedAt))

        const nodes: FlowExecutionNodeTimeline[] = [
            {
                nodeId: flowId as string,
                steps: [{
                    start: 0,
                    end: recordedDuration * scale,
                    error: !!result.error && !result.nodeResults?.nodes?.some(nodeResult => !!nodeResult?.error)
                }]
            },
            ...Array.from(new Set(nodeResults.map(nodeResult => nodeResult?.nodeFunction?.id as string)))
                .map(nodeId => ({
                    nodeId: nodeId,
                    steps: nodeResults
                        .filter(nodeResult => nodeResult?.nodeFunction?.id === nodeId)
                        .map(nodeResult => ({
                            start: (Number(nodeResult?.startedAt) - executionStart) * scale,
                            end: (Number(nodeResult?.finishedAt) - executionStart) * scale,
                            error: !!nodeResult?.error
                        }))
                }))
        ]

        return {
            duration: Math.max(...nodes.flatMap(node => node.steps.map(step => step.end))),
            hold: holdDuration,
            nodes: nodes
        }

    }, [flow?.executionResults?.nodes, selectedExecutionId, flowId, holdDuration, shortestPlayback, longestPlayback])
}
