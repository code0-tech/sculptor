"use client"

import React from "react"
import {useSubscription} from "@apollo/client/react"
import {Flow, Subscription} from "@code0-tech/sagittarius-graphql-types"
import {useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook"
import {useService} from "@code0-tech/pictor"
import {FlowService} from "@edition/flow/services/Flow.service"
import flowExecutionSubscription from "@edition/flow/services/subscriptions/Flow.execution.subscription.graphql"

export interface FlowExecutionWatcherComponentProps {
    flowId: Flow['id']
}

/**
 * Holds one subscription for as long as the flow is open. Every announced execution is loaded by its
 * identifier and written into the flow store, which also resolves the pending manual execution of
 * exactly that identifier.
 */
export const FlowExecutionWatcherComponent: React.FC<FlowExecutionWatcherComponentProps> = ({flowId}) => {

    const flowService = useService(FlowService)
    const removeExecution = useFlowExecutionStore(s => s.removeExecution)

    useSubscription<Subscription>(flowExecutionSubscription, {
        variables: {flowId},
        onData: async (data) => {
            const executionIdentifier = data.data.data?.namespacesProjectsFlowsExecution?.executionIdentifier
            if (!executionIdentifier) return
            await flowService.loadExecutionResult(flowId, executionIdentifier)
            removeExecution(executionIdentifier)
        },
        onError: () => useFlowExecutionStore.getState().executions
            .filter(execution => execution.flowId === flowId)
            .forEach(execution => removeExecution(execution.executionIdentifier)),
    })

    return null
}
