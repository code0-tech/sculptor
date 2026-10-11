import {DriveStep} from "driver.js";
import {TutorialContext} from "@ce-internal/tutorial/utils/Tutorial.level.util";
import {getNamespaceTutorialSteps as getCeNamespaceTutorialSteps} from "@ce-internal/tutorial/utils/Tutorial.namespaceSteps.util";

/**
 * Workspace tour plus the upgrade entry point, which only exists on cloud. The step
 * is skipped automatically while the workspace already runs on an active license.
 */
export const getNamespaceTutorialSteps = (context: TutorialContext): DriveStep[] => [
    ...getCeNamespaceTutorialSteps(context),
    {
        element: '[data-qa-selector="dashboard-namespace-upgrade"]',
        popover: {
            side: "right",
            align: "end",
            title: "More headroom",
            description: "Your workspace runs on the free plan. Upgrading raises the limits for workflow executions and AI tokens you just saw in the navigation."
        }
    }
]
