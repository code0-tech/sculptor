import {create} from "zustand"

interface FlowReferenceHoverState {
    hoveredNodeId: string | null
    setHoveredNodeId: (nodeId: string | null) => void
}

export const useFlowReferenceHoverStore = create<FlowReferenceHoverState>((setState) => ({
    hoveredNodeId: null,
    setHoveredNodeId: (hoveredNodeId: string | null) => setState({hoveredNodeId}),
}))
