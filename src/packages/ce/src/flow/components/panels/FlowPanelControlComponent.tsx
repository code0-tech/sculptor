import React from "react";
import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
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
import {FunctionSuggestionMenuComponent} from "@edition/function/components/suggestion/FunctionSuggestionMenuComponent";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useNodeSuggestions} from "@edition/function/hooks/FunctionNodeSuggestions.hook";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {FunctionSuggestion} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {Suggestion} from "@edition/function/components/suggestion/Suggestion.util";
import {useHotkeys} from "react-hotkeys-hook";
import {IconCommand} from "@tabler/icons-react";

export interface FlowPanelControlComponentProps {
    flowId: Flow['id']
}

export const FlowPanelControlComponent: React.FC<FlowPanelControlComponentProps> = (props) => {

    //props
    const {flowId} = props

    //services and stores
    const fileTabsService = useService(FileTabsService)
    const fileTabsStore = useStore(FileTabsService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const [, startTransition] = React.useTransition()
    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const [addNextNodeTooltipOpen, setAddNextNodeTooltipOpen] = React.useState(false)

    //memoized values
    const activeTab = React.useMemo(() => {
        return fileTabsService.values().find((t: any) => (t as any).active)
    }, [fileTabsStore, fileTabsService])

    const result = useNodeSuggestions(null)

    //callbacks
    const deleteActiveNode = React.useCallback(() => {
        if (!activeTab) return
        if (!(activeTab?.content?.props?.flowId as Flow['id'])) return
        // @ts-ignore
        startTransition(async () => {
            const linkedNodes = flowService.getLinkedNodesById(flowId, activeTab?.content?.props?.node.id)
            linkedNodes.forEach(node => {
                if (node.id) fileTabsService.deleteById(node.id)
            })

            await flowService.deleteNodeById((activeTab?.content?.props?.flowId as Flow['id']), (activeTab?.content?.props?.node.id as NodeFunction['id']))
        })
    }, [activeTab, flowService, flowStore])

    const addNodeToFlow = React.useCallback((suggestion: FunctionSuggestion | Suggestion) => {
        if (flowId && suggestion.value.__typename === "NodeFunction" && "node" in activeTab!.content?.props) {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, (activeTab?.content?.props.node.id as NodeFunction['id']) ?? undefined, suggestion.value as NodeFunction)
            })
        } else if (suggestion.value.__typename === "NodeFunction") {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, null, suggestion.value as NodeFunction)
            })
        }
    }, [flowId, flowService, flowStore, activeTab])

    useHotkeys('mod+k', (keyboardEvent) => {
        if (activeTab) setSuggestionDialogOpen(true)
        else setAddNextNodeTooltipOpen(true)
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    }, [activeTab])

    return <Panel position={"bottom-center"} data-qa-selector={"flow-builder-control-panel"}>

        <SuggestionDialogComponent suggestions={result}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={addNodeToFlow}
                                   onOpenChange={setSuggestionDialogOpen}/>

        <ButtonGroup style={{textWrap: "nowrap"}}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button data-qa-selector={"flow-builder-control-panel-delete"}
                            disabled={!activeTab || !(activeTab?.content?.props.flowId as Flow['id'])}
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
                            disabled={!activeTab}
                            paddingSize={"xxs"}
                            variant={"filled"}
                            onClick={() => {
                                if (activeTab) setSuggestionDialogOpen(true)
                            }}
                            color={"secondary"}>
                        <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                            Add next node (experimental)
                            <Badge style={{gap: 0}}>{navigator !== undefined && /Mac/.test(navigator.userAgent) ?
                                <IconCommand size={13}/> : "strg"} + K</Badge>
                        </Text>
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    {!activeTab && <TooltipContent sideOffset={8}>
                        <Text>Select a node to add a next node</Text>
                    </TooltipContent>}
                </TooltipPortal>
            </Tooltip>
            <FunctionSuggestionMenuComponent suggestions={result}
                                             onSuggestionSelect={addNodeToFlow}
                                             triggerContent={
                                                 <Button data-qa-selector={"flow-builder-control-panel-add"}
                                                         disabled={!activeTab}
                                                         paddingSize={"xxs"}
                                                         variant={"filled"}
                                                         color={"secondary"}>
                                                     <Text>Add next node</Text>
                                                 </Button>
                                             }/>
        </ButtonGroup>
    </Panel>

}
