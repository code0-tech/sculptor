import React from "react";
import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {
    Button,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {useSuggestions} from "@edition/function/hooks/FunctionSuggestion.hook";
import {Panel} from "@xyflow/react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {FunctionSuggestionMenuComponent} from "@edition/function/components/suggestion/FunctionSuggestionMenuComponent";
import {FlowService} from "@edition/flow/services/Flow.service";

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

    //memoized values
    const activeTab = React.useMemo(() => {
        return fileTabsService.values().find((t: any) => (t as any).active)
    }, [fileTabsStore, fileTabsService])

    const result = useSuggestions(flowId, activeTab?.content?.props?.node?.id as NodeFunction['id'] | undefined)

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

    const addNodeToFlow = React.useCallback((suggestion: any) => {
        if (flowId && suggestion.value.__typename === "NodeFunction" && "node" in activeTab!.content?.props) {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, (activeTab?.content?.props.node.id as NodeFunction['id']) ?? undefined, suggestion.value)
            })
        } else {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, null, suggestion.value)
            })
        }
    }, [flowId, flowService, flowStore, activeTab])

    return <Panel position={"bottom-center"}>
        <ButtonGroup style={{textWrap: "nowrap"}}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button disabled={!activeTab || !(activeTab?.content?.props.flowId as Flow['id'])}
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
            <FunctionSuggestionMenuComponent suggestions={result}
                                             onSuggestionSelect={addNodeToFlow}
                                             triggerContent={
                                     <Button disabled={!activeTab}
                                             paddingSize={"xxs"}
                                             variant={"filled"}
                                             color={"secondary"}>
                                         <Text>Add next node</Text>
                                     </Button>
                                 }/>
        </ButtonGroup>
    </Panel>

}
