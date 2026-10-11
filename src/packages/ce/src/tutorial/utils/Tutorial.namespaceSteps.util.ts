import {DriveStep} from "driver.js";
import {TutorialContext} from "@edition/tutorial/utils/Tutorial.level.util";
import {getUsageTutorialSteps} from "@edition/tutorial/utils/Tutorial.usageSteps.util";

/**
 * Tour of the workspace level (`/namespace/:id`).
 */
export const getNamespaceTutorialSteps = (context: TutorialContext): DriveStep[] => [
    ...getUsageTutorialSteps("namespace", context),
    {
        element: '[data-qa-selector="dashboard-project-list"]',
        popover: {
            side: "right",
            align: "start",
            title: "Quick project access",
            description: "The same projects as a list, always one click away while you work inside this workspace."
        }
    },
    {
        element: '[data-qa-selector="dashboard-flow-recent-list"]',
        popover: {
            side: "right",
            align: "start",
            title: "Recent workflows",
            description: "Jump straight back into a flow you edited recently, without walking through its project first."
        }
    },
    {
        element: '[data-qa-selector="dashboard-namespace-menu"]',
        popover: {
            side: "right",
            align: "end",
            title: "Workspace menu",
            description: "Switch workspaces, or open the members, roles, servers and licenses of this one. What you may change there depends on your role in the workspace."
        }
    },
    {
        element: '[data-qa-selector="dashboard-namespace-stats"]',
        popover: {
            side: "bottom",
            align: "center",
            title: "Workspace numbers",
            description: "The same overview as on the home screen, narrowed down to this workspace: new projects, saved time and flows that currently fail validation."
        }
    },
    {
        element: '[data-qa-selector="dashboard-attention-flows"]',
        popover: {
            side: "bottom",
            align: "center",
            title: "Flows that need you",
            description: "Open this card to see every flow of this workspace that failed its last validation or execution."
        }
    },
    {
        element: '[data-qa-selector="dashboard-project-table"]',
        popover: {
            side: "top",
            align: "center",
            title: "Projects",
            description: context.createProject
                ? "Every project of this workspace. Filter and sort them here, or create a new one. A project holds your flows and is bound to a primary server."
                : "Every project of this workspace. Filter and sort them here. A project holds your flows and is bound to a primary server."
        }
    }
]
