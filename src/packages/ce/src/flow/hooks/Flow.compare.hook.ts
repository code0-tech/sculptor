import { create } from 'zustand'
import {FlowView} from "@ce/flow/services/Flow.view";

export const useFlowCompareStore = create<{
    flow: FlowView | null
}>((setState) => ({
    flow: null,
    setFlow: (flow: FlowView) => setState({flow}),
    clearFlow: () => setState({flow: null}),
}))