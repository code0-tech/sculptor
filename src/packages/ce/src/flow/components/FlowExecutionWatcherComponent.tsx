"use client"

import React from "react"
import {useSubscription} from "@apollo/client/react"
import {ExecutionResult, Flow, Subscription} from "@code0-tech/sagittarius-graphql-types"
import {useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook"
import {useService} from "@code0-tech/pictor"
import {FlowService} from "@edition/flow/services/Flow.service"
import flowExecutionResultSubscription from "@edition/flow/services/subscriptions/Flow.executionResult.subscription.graphql"

export interface FlowExecutionWatcherComponentProps {
    flowId: Flow['id']
}

/**
 * Holds one subscription for as long as the flow is open and writes every execution result of
 * that flow into the flow store. Results carry no execution identifier, so a pending manual
 * execution is resolved in arrival order rather than matched to its own result.
 */
export const FlowExecutionWatcherComponent: React.FC<FlowExecutionWatcherComponentProps> = ({flowId}) => {

    const flowService = useService(FlowService)
    const removeExecution = useFlowExecutionStore(s => s.removeExecution)

    useSubscription<Subscription>(flowExecutionResultSubscription, {
        variables: {flowId},
        onData: (data) => {
            const executionResult = data.data.data?.namespacesProjectsFlowsExecutionResult?.executionResult as ExecutionResult | undefined
            if (!executionResult) return
            flowService.addExecutionResult(flowId, executionResult)
            const pending = useFlowExecutionStore.getState().executions.find(execution => execution.flowId === flowId)
            if (pending) removeExecution(pending.executionIdentifier)
        },
        onError: () => useFlowExecutionStore.getState().executions
            .filter(execution => execution.flowId === flowId)
            .forEach(execution => removeExecution(execution.executionIdentifier)),
    })

    return null
}
