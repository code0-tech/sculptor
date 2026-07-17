import {create} from "zustand"

/**
 * Shared state for the flow view side panels (file / execution). Lifting this out of
 * the page component lets deeply nested components (e.g. the definition panel dialog)
 * open a specific panel without prop drilling.
 */
interface FlowViewState {
    tab?: string
    setTab: (tab?: string) => void
    toggleTab: (tab: string) => void
}

export const useFlowViewStore = create<FlowViewState>((setState) => ({
    tab: undefined,
    setTab: (tab) => setState({tab}),
    toggleTab: (tab) => setState((state) => ({tab: state.tab === tab ? undefined : tab})),
}))
