import React from "react";
import {Flow, LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {
    AuroraBackground,
    Badge,
    Button,
    Card,
    EditorInput,
    Flex,
    SelectContent,
    SelectItem,
    SelectItemText,
    SelectPortal,
    SelectTrigger,
    SelectValue,
    SelectViewport,
    Spacing,
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
import {
    IconArrowBigUp,
    IconBackspace,
    IconChevronDown,
    IconLetterA,
    IconLetterQ,
    IconSend,
    IconX
} from "@tabler/icons-react";
import {HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger} from "@radix-ui/react-hover-card";
import {ChaoticOrbit} from "ldrs/react";
import {StreamLanguage} from "@codemirror/language";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {Select} from "@radix-ui/react-select";
import {SiClaude} from "@icons-pack/react-simple-icons";
import 'ldrs/react/ChaoticOrbit.css'

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
    }, [selectedNode])

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
                                <Text>Delete node</Text>
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
                                    Add node
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
                        Ask AI
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
                    <Flex w={"100%"} justify={"center"}>
                        <ButtonGroup color={"secondary"}>
                            <Button color={"error"} paddingSize={"xxs"}>
                                Discard
                            </Button>
                            <Button color={"success"} paddingSize={"xxs"}>
                                Accept
                            </Button>
                        </ButtonGroup>
                    </Flex>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <ChaoticOrbit
                            size="16"
                            speed="1.5"
                            color="white"
                        />
                        <Text>
                            Generating...
                        </Text>
                    </Flex>
                    <Card paddingSize={"xxs"} color={"secondary"} w={"var(--radix-popper-anchor-width)"}>
                        <EditorInput
                            wrapperComponent={{
                                style: {
                                    background: "transparent",
                                    boxShadow: "none"
                                }
                            }}
                            placeholder={"Ask AI anything..."}
                            language={StreamLanguage.define({
                                token(stream) {
                                    stream.next()
                                    return null;
                                }
                            })}/>
                        <Spacing spacing={"xxs"}/>
                        <CardSection>
                            <Flex justify={"space-between"} align={"center"}>
                                <Flex align={"center"} style={{gap: "0.35rem"}}>
                                    <Select defaultValue={"ask"}>
                                        <SelectTrigger w={"fit-content"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"}>
                                                <SelectValue placeholder={"Select mode"}/>
                                                <IconChevronDown size={13}/>
                                            </Button>
                                        </SelectTrigger>
                                        <SelectPortal>
                                            <SelectContent>
                                                <SelectViewport>
                                                    <SelectItem value={"ask"}>
                                                        <SelectItemText>
                                                            <Text>Ask</Text>
                                                        </SelectItemText>
                                                    </SelectItem>
                                                    <SelectItem value={"agent"}>
                                                        <SelectItemText>
                                                            <Text>Agent</Text>
                                                        </SelectItemText>
                                                    </SelectItem>
                                                </SelectViewport>
                                            </SelectContent>
                                        </SelectPortal>
                                    </Select>
                                    <Select defaultValue={"claude-opus-4.7"}>
                                        <SelectTrigger w={"fit-content"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"}>
                                                <SelectValue placeholder={"Select modal"}/>
                                                <IconChevronDown size={13}/>
                                            </Button>
                                        </SelectTrigger>
                                        <SelectPortal>
                                            <SelectContent>
                                                <SelectViewport>
                                                    <SelectItem value={"claude-opus-4.7"}>
                                                        <SelectItemText>
                                                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                                <Text display={"flex"} align={"center"}
                                                                      style={{gap: "0.35rem"}}>
                                                                    <SiClaude size={13} color={"default"}/>
                                                                    Claude Opus 4.7
                                                                </Text>
                                                                <Text>
                                                                    (4.0x)
                                                                </Text>
                                                            </Flex>
                                                        </SelectItemText>
                                                    </SelectItem>
                                                </SelectViewport>
                                            </SelectContent>
                                        </SelectPortal>
                                    </Select>
                                </Flex>
                                <Flex align={"center"} style={{gap: "0.35rem"}}>
                                    <Button variant={"none"} color={"tertiary"}
                                            onClick={() => setAiOpen(false)}>
                                        <IconX size={13}/>
                                    </Button>
                                    <Button variant={"none"} color={"tertiary"}>
                                        <IconSend size={13}/>
                                    </Button>
                                </Flex>
                            </Flex>
                        </CardSection>
                    </Card>
                </Flex>

            </HoverCardContent>
        </HoverCardPortal>

    </HoverCard>;

}
