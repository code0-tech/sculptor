import {DriveStep} from "driver.js";
import {TutorialContext} from "@edition/tutorial/utils/Tutorial.level.util";

/**
 * Steps for the flow explorer in the project sidebar. Shared by the project and the
 * flow level because both render the same sidebar slot.
 */
export const getExplorerTutorialSteps = (context: TutorialContext): DriveStep[] => [
    {
        element: '[data-qa-selector="dashboard-flow-explorer"]',
        popover: {
            side: "right",
            align: "start",
            title: "Flow explorer",
            description: "Below this header sit all flows of the project, grouped into folders by their name. The buttons jump to the active flow, collapse or expand the whole tree."
        }
    },
    ...(context.createFlow ? [
        {
            element: '[data-qa-selector="dashboard-flow-create"]',
            popover: {
                side: "right",
                align: "start",
                title: "Create a flow",
                description: "Start from a template or pick a trigger yourself. The trigger decides when your flow runs: an HTTP request, a schedule or an event."
            }
        } satisfies DriveStep
    ] : [])
]
