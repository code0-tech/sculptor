import {DriveStep} from "driver.js";
import {TutorialContext} from "@edition/tutorial/utils/Tutorial.level.util";
import {getExplorerTutorialSteps} from "@edition/tutorial/utils/Tutorial.explorerSteps.util";

/**
 * Tour of the project level (`/namespace/:id/project/:id`).
 */
export const getProjectTutorialSteps = (context: TutorialContext): DriveStep[] => [
    ...getExplorerTutorialSteps(context),
    {
        element: '[data-qa-selector="dashboard-project-menu"]',
        popover: {
            side: "right",
            align: "end",
            title: "Project settings",
            description: "Head back to the workspace, switch projects, or manage this project's servers and settings."
        }
    },
    {
        element: '[data-qa-selector="dashboard-project-ai-chat"]',
        popover: {
            side: "top",
            align: "center",
            title: "Describe what you need",
            description: "Write down the automation you have in mind and let the model build the flow for you. You can edit every generated node afterwards."
        }
    },
    {
        element: '[data-qa-selector="dashboard-project-templates"]',
        popover: {
            side: "bottom",
            align: "center",
            title: "Need an idea?",
            description: "Pick one of the examples to drop a ready made prompt into the chat, then adjust it to your own services."
        }
    }
]
