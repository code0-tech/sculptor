import {DriveStep} from "driver.js";
import {TutorialContext, TutorialLevel} from "@ce-internal/tutorial/utils/Tutorial.level.util";

/**
 * On cloud the license belongs to a single workspace, so the usage indicator only
 * appears once the user is inside one. It is explained on the workspace level
 * instead of the application level.
 */
export const getUsageTutorialSteps = (level: TutorialLevel, context: TutorialContext): DriveStep[] => {
    if (level !== "namespace" || !context.usageAccessible) return []

    return [
        {
            element: '[data-qa-selector="dashboard-usage"]',
            popover: {
                side: "right",
                align: "start",
                title: "Usage of this workspace",
                description: "How much of this workspace's plan is already used. Workflow executions on the outside, AI tokens on the inside. Hover them for exact numbers."
            }
        }
    ]
}
