import {create} from 'zustand'

export type FlowLayoutDirection = "vertical" | "horizontal"

interface FlowLayoutState {
    direction: FlowLayoutDirection
    setDirection: (direction: FlowLayoutDirection) => void
}

export const useFlowLayoutStore = create<FlowLayoutState>((setState) => ({
    direction: "vertical",
    setDirection: (direction: FlowLayoutDirection) => setState({direction}),
}))

export const useFlowLayoutHorizontal = () => useFlowLayoutStore(state => state.direction === "horizontal")
