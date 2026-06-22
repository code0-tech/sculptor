import { create } from 'zustand'
import {FlowView} from "@edition/flow/services/Flow.view";

interface FlowCompareState {
    flow: FlowView | null
    setFlow: (flow: FlowView) => void
    clearFlow: () => void
}

export const useFlowCompareStore = create<FlowCompareState>((setState) => ({
    flow: null,
    setFlow: (flow: FlowView) => setState({flow}),
    clearFlow: () => setState({flow: null}),
}))