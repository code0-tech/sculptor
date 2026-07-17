"use client"

import React from "react"
import {useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook"
import {FlowExecutionSubscriberComponent} from "@edition/flow/components/FlowExecutionSubscriberComponent"

/**
 * Keeps one subscription alive per pending manual execution. Each subscriber writes
 * the incoming execution result into the flow store and drops the pending entry.
 */
export const FlowExecutionWatcherComponent: React.FC = () => {

    const executions = useFlowExecutionStore(s => s.executions)

    return <>
        {executions.map(execution => (
            <FlowExecutionSubscriberComponent
                key={execution.executionIdentifier}
                execution={execution}
            />
        ))}
    </>
}
