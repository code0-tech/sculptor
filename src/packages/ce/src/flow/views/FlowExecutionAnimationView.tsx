"use client"

import React from "react"
import {
    FlowExecutionNodeStatus,
    useFlowExecutionAnimationStore,
    useFlowExecutionTimeline
} from "@edition/flow/hooks/Flow.executionAnimation.hook"
import {executionNodeStatus} from "@edition/flow/utils/Flow.executionNodeStatus.util"

export const FlowExecutionAnimationView: React.FC = () => {

    const {duration, hold, nodes} = useFlowExecutionTimeline()
    const setStatuses = useFlowExecutionAnimationStore(state => state.setStatuses)
    const reset = useFlowExecutionAnimationStore(state => state.reset)

    const frameInterval = 33

    React.useEffect(() => {

        if (nodes.length <= 1) {
            reset()
            return
        }

        const cycle = duration + hold
        const startedAt = performance.now()

        const interval = window.setInterval(() => {
            const time = Math.min((performance.now() - startedAt) % cycle, duration)
            setStatuses(Object.fromEntries(nodes.map((node): [string, FlowExecutionNodeStatus] =>
                [node.nodeId, executionNodeStatus(node, time)])))
        }, frameInterval)

        return () => {
            window.clearInterval(interval)
            reset()
        }

    }, [nodes, duration, hold, frameInterval, setStatuses, reset])

    return null
}
