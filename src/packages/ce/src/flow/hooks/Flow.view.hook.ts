import {create} from "zustand"

/**
 * Shared state for the flow view side panels (file / execution). Lifting this out of
 * the page component lets deeply nested components (e.g. the definition panel dialog)
 * open a specific panel without prop drilling. `selectNode` is registered by the flow
 * page, which is the only place that knows the nodes of the canvas, so callers outside
 * the react flow provider (e.g. the tutorial) can select a node to edit.
 */
interface FlowViewState {
    tab?: string
    selectNode?: () => void
    setTab: (tab?: string) => void
    toggleTab: (tab: string) => void
    setSelectNode: (selectNode?: () => void) => void
}

export const useFlowViewStore = create<FlowViewState>((setState) => ({
    tab: undefined,
    selectNode: undefined,
    setTab: (tab) => setState({tab}),
    toggleTab: (tab) => setState((state) => ({tab: state.tab === tab ? undefined : tab})),
    setSelectNode: (selectNode) => setState({selectNode}),
}))
