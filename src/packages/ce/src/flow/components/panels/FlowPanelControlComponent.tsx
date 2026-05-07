import React from "react";
import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {
    Badge,
    Button,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {Panel} from "@xyflow/react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {FlowService} from "@edition/flow/services/Flow.service";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {FunctionSuggestion} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {Suggestion} from "@edition/function/components/suggestion/Suggestion.util";
import {useHotkeys} from "react-hotkeys-hook";
import {useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";

export interface FlowPanelControlComponentProps {
    flowId: Flow['id']
}

export const FlowPanelControlComponent: React.FC<FlowPanelControlComponentProps> = (props) => {

    //props
    const {flowId} = props

    //services and stores
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const [, startTransition] = React.useTransition()
    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const [addNextNodeTooltipOpen, setAddNextNodeTooltipOpen] = React.useState(false)

    //memoized values
    const selectedNode = useSelectedFunctionNode()

    const result = useFunctionSuggestions()

    //callbacks
    const deleteActiveNode = React.useCallback(() => {
        if (!selectedNode) return
        // @ts-ignore
        startTransition(async () => {
            await flowService.deleteNodeById(flowId, selectedNode?.id as NodeFunction['id'])
        })
    }, [selectedNode, flowService, flowStore])

    const addNodeToFlow = React.useCallback((suggestion: FunctionSuggestion | Suggestion) => {
        if (flowId && suggestion.value.__typename === "NodeFunction" && selectedNode?.id.includes("NodeFunction")) {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, selectedNode?.id as NodeFunction['id'], suggestion.value as NodeFunction)
            })
        } else if (suggestion.value.__typename === "NodeFunction") {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, null, suggestion.value as NodeFunction)
            })
        }
    }, [flowId, flowService, flowStore, selectedNode])

    useHotkeys('shift+a', (keyboardEvent) => {
        if (selectedNode) setSuggestionDialogOpen(true)
        else setAddNextNodeTooltipOpen(true)
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    }, [selectedNode])

    return <Panel position={"bottom-center"} data-qa-selector={"flow-builder-control-panel"}>

        <SuggestionDialogComponent suggestions={result}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={addNodeToFlow}
                                   onOpenChange={setSuggestionDialogOpen}/>

        <ButtonGroup style={{textWrap: "nowrap"}}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button data-qa-selector={"flow-builder-control-panel-delete"}
                            disabled={!selectedNode}
                            onClick={deleteActiveNode}
                            paddingSize={"xxs"}
                            variant={"filled"}
                            color={"error"}>
                        <Text>Delete node</Text>
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent sideOffset={8}>
                        <Text>Select a node to delete it</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip open={addNextNodeTooltipOpen} onOpenChange={setAddNextNodeTooltipOpen}>
                <TooltipTrigger asChild>
                    <Button data-qa-selector={"flow-builder-control-panel-add"}
                            disabled={!selectedNode}
                            paddingSize={"xxs"}
                            variant={"filled"}
                            onClick={() => {
                                if (selectedNode) setSuggestionDialogOpen(true)
                            }}
                            color={"secondary"}>
                        <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                            Add next node
                            <Badge style={{gap: 0}}>Shift + A</Badge>
                        </Text>
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    {!selectedNode && <TooltipContent sideOffset={8}>
                        <Text>Select a node to add a next node</Text>
                    </TooltipContent>}
                </TooltipPortal>
            </Tooltip>
        </ButtonGroup>
    </Panel>

}
