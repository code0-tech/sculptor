export type TutorialLevel = "application" | "namespace" | "project" | "flow"

/**
 * Everything the steps of a level need to know about the current user: which parts of
 * the ui are rendered for them at all, and how to open a panel that is mounted on
 * demand or select the node its panel edits. Permissions are read from the same source as the ui, so a step is never
 * offered for something the user cannot see or do.
 */
export interface TutorialContext {
    usageAccessible: boolean
    createProject: boolean
    createFlow: boolean
    openTab: (tab: string) => void
    selectNode?: () => void
}

/**
 * Resolves the tutorial level from the current pathname. Matches are exact so that
 * an open intercepting route dialog (e.g. `/namespace/1/settings`) resolves to no
 * level at all, which keeps the tour away from focus trapped dialogs.
 */
export const getTutorialLevel = (pathname: string): TutorialLevel | undefined => {
    if (/^\/$/.test(pathname)) return "application"
    if (/^\/namespace\/\d+$/.test(pathname)) return "namespace"
    if (/^\/namespace\/\d+\/project\/\d+$/.test(pathname)) return "project"
    if (/^\/namespace\/\d+\/project\/\d+\/flow\/\d+$/.test(pathname)) return "flow"
    return undefined
}
