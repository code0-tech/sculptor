import { create } from 'zustand'
import {FlowView} from "@edition/flow/services/Flow.view";

export const useFlowCompareStore = create<{
    flow: FlowView | null
}>((setState) => ({
    flow: null,
    setFlow: (flow: FlowView) => setState({flow}),
    clearFlow: () => setState({flow: null}),
}))