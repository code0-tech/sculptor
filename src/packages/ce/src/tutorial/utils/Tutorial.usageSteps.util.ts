import {DriveStep} from "driver.js";
import {TutorialContext, TutorialLevel} from "@edition/tutorial/utils/Tutorial.level.util";

/**
 * The usage indicator in the navigation rail is explained on the level its license
 * belongs to, which differs per edition: ce and ee license the whole application and
 * only show it to admins, cloud licenses a single workspace.
 */
export const getUsageTutorialSteps = (level: TutorialLevel, context: TutorialContext): DriveStep[] => {
    if (level !== "application" || !context.usageAccessible) return []

    return [
        {
            element: '[data-qa-selector="dashboard-usage"]',
            popover: {
                side: "right",
                align: "start",
                title: "Usage at a glance",
                description: "How much of this installation's license is already used. Workflow executions on the outside, AI tokens on the inside. Hover them for exact numbers."
            }
        }
    ]
}
