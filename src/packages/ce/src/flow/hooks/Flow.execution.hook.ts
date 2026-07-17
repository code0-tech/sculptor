import {create} from "zustand"
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types"

export interface FlowExecution {
    executionIdentifier: string
    flowId: Flow['id']
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
}

interface FlowExecutionState {
    executions: FlowExecution[]
    addExecution: (execution: FlowExecution) => void
    removeExecution: (executionIdentifier: string) => void
}

export const useFlowExecutionStore = create<FlowExecutionState>((setState) => ({
    executions: [],
    addExecution: (execution) => setState((state) => ({
        executions: state.executions.some(e => e.executionIdentifier === execution.executionIdentifier)
            ? state.executions
            : [...state.executions, execution]
    })),
    removeExecution: (executionIdentifier) => setState((state) => ({
        executions: state.executions.filter(e => e.executionIdentifier !== executionIdentifier)
    })),
}))
