import React from "react";
import {
    AiGenerateFlowSubscriptionPayload,
    Flow,
    LiteralValue,
    Namespace,
    NamespaceProject,
    NodeFunction,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {
    Badge,
    Button,
    Flex,
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
import {useHotkeys} from "react-hotkeys-hook";
import {useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";
import {IconArrowBigUp, IconBackspace, IconLetterA, IconLetterQ} from "@tabler/icons-react";
import {HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger} from "@radix-ui/react-hover-card";
import 'ldrs/react/ChaoticOrbit.css'
import {AIChatComponent} from "@edition/ai/components/AIChatComponent";
import {mapAiGenerationFlowToFlowInput} from "@edition/ai/util/AI.flow.mapper";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";
import {useFlowCompareStore} from "@edition/flow/hooks/Flow.compare.hook";
import {FlowView} from "@edition/flow/services/Flow.view";

export interface FlowPanelControlComponentProps {
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
    flowId: Flow['id']
}

export const FlowPanelControlComponent: React.FC<FlowPanelControlComponentProps> = (props) => {

    //props
    const {namespaceId, projectId, flowId} = props

    //services and stores
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const compareFlow = useFlowCompareStore(state => state.flow)
    const setCompareFlow = useFlowCompareStore(state => state.setFlow)
    const clearCompareFlow = useFlowCompareStore(state => state.clearFlow)

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

    const onAIData = React.useCallback((payload: AiGenerateFlowSubscriptionPayload) => {
        const aiFlow = payload?.flow
        if (!aiFlow) return "No flow returned. Try again."

        const currentFlow = flowService.getById(flowId, {namespaceId, projectId})
        if (!currentFlow) return "Flow not found. Try again."

        const currentFlowName = currentFlow.name ?? undefined
        const existingNames = (flowService.values({namespaceId, projectId}) ?? [])
            .map(f => f.name)
            .filter((n): n is string => !!n && n !== currentFlowName)

        const flowInput = mapAiGenerationFlowToFlowInput(aiFlow, {existingNames})
        if (!flowInput) return "Invalid flow type. Try another model."

        const oldFlowSnapshot: FlowView = JSON.parse(JSON.stringify(currentFlow))

        flowService.flowUpdate({
            flowId: flowId!,
            flowInput: flowInput,
        }, true).then(result => {
            if ((result?.errors?.length ?? 0) <= 0) {
                setCompareFlow(oldFlowSnapshot)
                addIslandSuccessNotification({message: "Updated flow"})
            }
        })
    }, [flowService, flowStore, namespaceId, projectId, flowId, setCompareFlow])

    const onAcceptAIChanges = React.useCallback(() => {
        clearCompareFlow()
    }, [clearCompareFlow])

    const onDiscardAIChanges = React.useCallback(() => {
        if (!compareFlow) return
        const flowInput = flowService.getPayload(compareFlow)
        flowService.flowUpdate({
            flowId: flowId!,
            flowInput: flowInput,
        }, true).then(result => {
            if ((result?.errors?.length ?? 0) <= 0) {
                clearCompareFlow()
            }
        })
    }, [compareFlow, flowService, flowId, clearCompareFlow])

    const addNodeToFlow = React.useCallback((suggestion: NodeFunction | ReferenceValue | LiteralValue | SubFlowValue) => {
        if (flowId && suggestion.__typename === "NodeFunction" && selectedNode?.id.includes("NodeFunction")) {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, selectedNode?.id as NodeFunction['id'], suggestion as NodeFunction)
            })
        } else if (suggestion.__typename === "NodeFunction") {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, null, suggestion as NodeFunction)
            })
        }
    }, [flowId, flowService, flowStore, selectedNode])

    const [aiOpen, setAiOpen] = React.useState(false)

    useHotkeys('shift+a', (keyboardEvent) => {
        if (selectedNode && !selectedNode.data.functionId) setSuggestionDialogOpen(true)
        else setAddNextNodeTooltipOpen(true)
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    }, [selectedNode])

    useHotkeys('backspace', (keyboardEvent) => {
        if (selectedNode) deleteActiveNode()
        else setAddNextNodeTooltipOpen(true)
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    }, [selectedNode])

    useHotkeys('shift+q', (keyboardEvent) => {
        setAiOpen(prevState => !prevState)
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    }, [])

    return <HoverCard open={aiOpen}>
        <HoverCardTrigger asChild>
            <Panel position={"bottom-center"} data-qa-selector={"flow-builder-control-panel"}>

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
                                    variant={"none"}
                                    color={"error"}>
                                <Text>Delete current node</Text>
                                <Badge color={"tertiary"}>
                                    <IconBackspace size={11}/>
                                </Badge>
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
                                    disabled={!selectedNode || !!selectedNode.data.functionId}
                                    paddingSize={"xxs"}
                                    variant={"none"}
                                    onClick={() => {
                                        if (selectedNode && !selectedNode.data.functionId) setSuggestionDialogOpen(true)
                                    }}
                                    color={"tertiary"}>
                                <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                                    Add next node
                                    <Badge color={"tertiary"}>
                                        <IconArrowBigUp size={10}/>
                                        +
                                        <IconLetterA size={10}/>
                                    </Badge>
                                </Text>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent sideOffset={8}>
                                <Text>Select a node to add a next node</Text>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                    <Button paddingSize={"xxs"}
                            variant={"none"}
                            onClick={() => setAiOpen(true)}>
                        Edit with AI
                        <Badge color={"tertiary"}>
                            <IconArrowBigUp size={10}/>
                            +
                            <IconLetterQ size={10}/>
                        </Badge>
                    </Button>
                </ButtonGroup>


            </Panel>
        </HoverCardTrigger>
        <HoverCardPortal>
            <HoverCardContent align={"start"} side={"bottom"}
                              style={{position: "absolute", transform: "translate(0%, -100%)", zIndex: 1}}>
                <Flex style={{flexDirection: "column", gap: "0.7rem"}} align={"start"}>
                    {compareFlow && (
                        <Flex w={"100%"} justify={"center"}>
                            <ButtonGroup color={"secondary"}>
                                <Button color={"error"} paddingSize={"xxs"} onClick={onDiscardAIChanges}>
                                    Discard
                                </Button>
                                <Button color={"success"} paddingSize={"xxs"} onClick={onAcceptAIChanges}>
                                    Accept
                                </Button>
                            </ButtonGroup>
                        </Flex>
                    )}
                    <AIChatComponent projectId={projectId}
                                     flowId={flowId}
                                     onData={onAIData}/>
                </Flex>

            </HoverCardContent>
        </HoverCardPortal>

    </HoverCard>;

}
