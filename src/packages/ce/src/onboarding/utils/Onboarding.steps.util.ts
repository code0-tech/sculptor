export type OnboardingStepKey =
    "workspace"
    | "project"
    | "openProject"
    | "flow"
    | "openFlow"
    | "node"
    | "execute"
    | "done"

/**
 * Everything the onboarding needs to know about where the user currently is and what
 * they already built. Counts come from the same services as the ui, so a step that is
 * already done (an account that was invited into a workspace with projects) completes
 * itself instead of asking for something that exists.
 */
export interface OnboardingContext {
    personalNamespaceIndex?: string
    namespaceIndex?: number
    projectIndex?: number
    flowIndex?: number
    projectCount: number
    flowCount: number
    nodeCount: number
    executed: boolean
}

/**
 * One task of the onboarding. `element` is spotlighted while it is on the page,
 * `dialogElement` takes over as soon as a modal dialog is open so that the focus
 * follows the user into it, and `completed` is read from the application state instead
 * of from a click, so every task is finished by actually doing it.
 */
export interface OnboardingStep {
    key: OnboardingStepKey
    title: string
    description: string
    element?: string
    dialogElement?: string
    completed: boolean
}

/**
 * The guided first run: into your own workspace, a project, the hello world webhook
 * flow and a manual execution of it. Deeper explanations stay with the tutorials,
 * which the last task points at. The node task only shows up when the flow was created
 * without the prepared template, because the template already brings its one node.
 */
export const getOnboardingSteps = (context: OnboardingContext): OnboardingStep[] => [
    {
        key: "workspace",
        title: "Open your workspace",
        description: "Your account comes with its own workspace. Everything you build lives in one, so let's start in yours.",
        element: '[data-qa-selector="dashboard-namespace-personal"]',
        completed: !!context.namespaceIndex
    },
    {
        key: "project",
        title: "Create a project",
        description: "A project groups your flows and points at the server that runs them. Create one and give it any name.",
        element: '[data-qa-selector="dashboard-project-create"]',
        dialogElement: '[data-qa-selector="dashboard-input-dialog-form"]',
        completed: context.projectCount > 0
    },
    {
        key: "openProject",
        title: "Open your project",
        description: "Pick your new project from the list to get to the place where flows are built.",
        element: '[data-qa-selector="dashboard-project-list"]',
        completed: !!context.projectIndex
    },
    {
        key: "flow",
        title: "Create your webhook flow",
        description: "Create a workflow and pick the webhook trigger, the only one offered to you here. It comes prepared as a hello world: an HTTP endpoint that answers every call with a json message. Confirm the name and the flow is yours.",
        element: '[data-qa-selector="dashboard-flow-create"]',
        dialogElement: '[data-qa-selector="flow-create-list"], [data-qa-selector="flow-create-form"]',
        completed: context.flowCount > 0
    },
    {
        key: "openFlow",
        title: "Open the flow",
        description: "Your flow is in the explorer on the left. Open it to get into the builder.",
        element: '[data-qa-selector="dashboard-flow-item"]',
        completed: !!context.flowIndex
    },
    {
        key: "node",
        title: "Add your first node",
        description: "Your flow is still empty. Select the trigger, add a node behind it and pick something simple that returns text. Save afterwards if the builder says unsaved.",
        element: '[data-qa-selector="flow-builder-control-panel-add"]',
        completed: context.nodeCount > 0
    },
    {
        key: "execute",
        title: "Run it yourself",
        description: "You don't have to wait for the real request. Execute the flow with a payload of your choice and watch the result come in.",
        element: '[data-qa-selector="flow-builder-control-panel-execute"]',
        dialogElement: '[data-qa-selector="flow-builder-manual-execution-form"]',
        completed: context.executed
    },
    {
        key: "done",
        title: "That was it",
        description: "You built and ran your first automation. Whenever you want to know what a level can do, the help button in the bottom right corner opens an interactive tutorial of exactly the page you are on.",
        completed: false
    }
]
