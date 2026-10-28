import {FlowExecutionNodeStatus, FlowExecutionNodeTimeline} from "@edition/flow/hooks/Flow.executionAnimation.hook"

export const executionNodeStatus = (node: FlowExecutionNodeTimeline, time: number): FlowExecutionNodeStatus => {
    const step = node.steps.findLast(ownStep => ownStep.start <= time)
    if (!step) return "idle"
    if (time < step.end) return "running"
    return step.error ? "error" : "success"
}
