import {DriveStep} from "driver.js";
import {TutorialContext} from "@edition/tutorial/utils/Tutorial.level.util";
import {getUsageTutorialSteps} from "@edition/tutorial/utils/Tutorial.usageSteps.util";

/**
 * Tour of the application level (`/`). The navigation rail is only explained here
 * because it stays the same on every deeper level.
 */
export const getApplicationTutorialSteps = (context: TutorialContext): DriveStep[] => [
    {
        element: '[data-qa-selector="dashboard-navigation"]',
        popover: {
            side: "right",
            align: "start",
            title: "Your navigation",
            description: "Everything that is not bound to a single workspace lives here: the home button, the application settings and your own account."
        }
    },
    ...getUsageTutorialSteps("application", context),
    {
        element: '[data-qa-selector="dashboard-navigation-user"]',
        popover: {
            side: "right",
            align: "end",
            title: "Your account",
            description: "Open your profile, your settings or jump straight into your personal workspace. Logging out happens here as well."
        }
    },
    {
        element: '[data-qa-selector="dashboard-namespace-list"]',
        popover: {
            side: "right",
            align: "start",
            title: "Workspaces",
            description: "A workspace groups projects, servers, members and roles. You always have a personal one, and you can create as many shared ones as your plan allows."
        }
    },
    {
        element: '[data-qa-selector="dashboard-project-recent-list"]',
        popover: {
            side: "right",
            align: "start",
            title: "Where you left off",
            description: "The projects you touched most recently, across all workspaces. The fastest way back into yesterday's work."
        }
    },
    {
        element: '[data-qa-selector="dashboard-stats"]',
        popover: {
            side: "bottom",
            align: "center",
            title: "Your numbers",
            description: "New workspaces and projects of the last 30 days, the time your automations saved, and how many flows are currently invalid."
        }
    },
    {
        element: '[data-qa-selector="dashboard-attention-flows"]',
        popover: {
            side: "bottom",
            align: "center",
            title: "Flows that need you",
            description: "Flows that failed validation or execution show up here first, so a broken automation never stays unnoticed."
        }
    },
    {
        element: '[data-qa-selector="dashboard-namespace-row"]',
        popover: {
            side: "top",
            align: "center",
            title: "Jump into a workspace",
            description: "Pick a workspace to see its projects, servers and members. That is the next level of this tour."
        }
    }
]
