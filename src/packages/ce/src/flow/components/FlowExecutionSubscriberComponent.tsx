"use client"

import React from "react"
import {useSubscription} from "@apollo/client/react"
import {ExecutionResult, Subscription} from "@code0-tech/sagittarius-graphql-types"
import {FlowExecution, useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook"
import {useService} from "@code0-tech/pictor"
import {FlowService} from "@edition/flow/services/Flow.service"
import flowExecutionResultSubscription from "@edition/flow/services/subscriptions/Flow.executionResult.subscription.graphql"

export interface FlowExecutionSubscriberComponentProps {
    execution: FlowExecution
}

export const FlowExecutionSubscriberComponent: React.FC<FlowExecutionSubscriberComponentProps> = ({execution}) => {

    const flowService = useService(FlowService)
    const removeExecution = useFlowExecutionStore(s => s.removeExecution)

    useSubscription<Subscription>(flowExecutionResultSubscription, {
        variables: {executionIdentifier: execution.executionIdentifier},
        onData: (data) => {
            const executionResult = data.data.data?.namespacesProjectsFlowsExecutionResult?.executionResult as ExecutionResult | undefined
            if (executionResult) {
                flowService.addExecutionResult(execution.flowId, executionResult)
                removeExecution(execution.executionIdentifier)
            }
        },
        onComplete: () => removeExecution(execution.executionIdentifier),
        onError: () => removeExecution(execution.executionIdentifier),
    })

    return null
}
