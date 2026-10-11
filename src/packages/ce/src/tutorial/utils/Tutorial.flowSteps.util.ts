import {DriveStep} from "driver.js";
import {TutorialContext} from "@edition/tutorial/utils/Tutorial.level.util";

/**
 * Tour of the flow level (`/namespace/:id/project/:id/flow/:id`). The file panel is
 * rendered on demand, so the step in front of it opens the panel and selects a node to
 * edit (the trigger when the flow has no nodes yet) to make sure the panel shows a file
 * once the tour moves on. Every file keeps its tab content mounted, so the step picks
 * the content of the active tab instead of the first one in the dom.
 */
export const getFlowTutorialSteps = (context: TutorialContext): DriveStep[] => [
    {
        element: '[data-qa-selector="flow-builder-canvas"]',
        popover: {
            side: "top",
            align: "center",
            title: "The flow builder",
            description: "Your automation as a tree: it starts at the trigger and runs downwards. Drag to pan, scroll to zoom, and click a node to center it."
        }
    },
    {
        element: '[data-qa-selector="flow-builder-trigger"]',
        popover: {
            side: "right",
            align: "center",
            title: "The trigger",
            description: "The entry point of every flow. It decides when the flow runs and what payload it receives. Its settings are what you configure first."
        }
    },
    {
        element: '[data-qa-selector="flow-builder-node"]',
        popover: {
            side: "right",
            align: "center",
            title: "Nodes do the work",
            description: "Each node calls one function of your servers. Select a node to edit its parameters, and reference the result of earlier nodes in the ones below."
        }
    },
    {
        element: '[data-qa-selector="flow-builder-control-panel"]',
        popover: {
            side: "top",
            align: "center",
            title: "Build and run",
            description: "Add a node behind the selected one, delete it, let AI rework the flow, or execute it with a payload of your choice. Every button has a keyboard shortcut."
        }
    },
    {
        element: '[data-qa-selector="flow-builder-panel-layout"]',
        popover: {
            side: "bottom",
            align: "center",
            title: "Name and save state",
            description: "Your changes stay local until you save them. This is where you see unsaved changes and push them to the server."
        }
    },
    {
        element: '[data-qa-selector="flow-builder-tabs"]',
        onHighlightStarted: () => {
            context.selectNode?.()
            context.openTab("file")
        },
        popover: {
            side: "left",
            align: "start",
            title: "Two side panels",
            description: "The pencil opens the editor for the selected node, the play button the result of the last execution. Shift+1 and Shift+2 do the same."
        }
    },
    {
        element: '[data-qa-selector="flow-builder-file-content"][data-state="active"]',
        popover: {
            side: "left",
            align: "center",
            title: "Parameters and settings",
            description: "Fill the parameters of the selected node here. Values can be typed in literally or referenced from the trigger payload and from earlier nodes."
        }
    }
]
