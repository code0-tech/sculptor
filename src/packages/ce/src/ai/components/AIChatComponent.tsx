import React from "react";
import {
    Button,
    ButtonGroup,
    Card,
    EditorInput,
    Flex,
    Progress,
    SelectContent,
    SelectItem,
    SelectItemText,
    SelectPortal,
    SelectTrigger,
    SelectValue,
    SelectViewport,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import Link from "next/link";
import {StreamLanguage} from "@codemirror/language";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {Select} from "@radix-ui/react-select";
import {IconChevronDown, IconPlayerStop, IconSend, IconSparkles2Filled, IconX} from "@tabler/icons-react";
import {AIService} from "@edition/ai/services/AI.service";
import {motion} from "framer-motion";
import {AiGenerateFlowSubscriptionPayload, Flow, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {useAIGenerationStore} from "@edition/ai/hooks/AI.generation.hook";
import {AIGeneratingMessageComponent} from "@edition/ai/components/AIGeneratingMessageComponent";

export interface AIChatComponentProps {
    projectId: NamespaceProject['id']
    flowId?: Flow['id']
    prompt?: string
    onData?: (data: AiGenerateFlowSubscriptionPayload) => string | void
    onClose?: () => void

}

export const AIChatComponent: React.FC<AIChatComponentProps> = (props) => {

    const {projectId, flowId, prompt = "", onData, onClose} = props

    const aiService = useService(AIService)
    const aiStore = useStore(AIService)
    const addGeneration = useAIGenerationStore(s => s.addGeneration)
    const removeGeneration = useAIGenerationStore(s => s.removeGeneration)

    const [promptState, setPromptState] = React.useState<string>(prompt)
    const [model, setModel] = React.useState<string | undefined>(undefined)
    const [executionIdentifier, setExecutionIdentifier] = React.useState<string | null>(null)
    const [aiErrorMessage, setAiErrorMessage] = React.useState<string | null>(null)

    const isThisGenerating = useAIGenerationStore(s =>
        !!executionIdentifier && s.hasGeneration(executionIdentifier)
    )

    const models = React.useMemo(
        () => aiService.values(),
        [aiStore]
    )

    React.useEffect(() => {
        if (executionIdentifier && !isThisGenerating) {
            if (!aiErrorMessage) setPromptState("")
            setExecutionIdentifier(null)
        }
    }, [executionIdentifier, isThisGenerating, aiErrorMessage])

    const aiLoading = !!executionIdentifier && isThisGenerating

    const onSend = React.useCallback(() => {
        setAiErrorMessage(null)
        aiService.generateFlow({
            prompt: promptState,
            projectId: projectId!,
            modelIdentifier: model!,
            flowId: flowId,
        }).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0 && payload?.executionIdentifier) {
                const id = payload.executionIdentifier
                setExecutionIdentifier(id)
                addGeneration({
                    executionIdentifier: id,
                    onData: (data) => onData?.(data),
                    onError: (message) => setAiErrorMessage(message),
                })
            }
        })
    }, [aiService, model, promptState, projectId, flowId, onData, addGeneration])

    const onStop = React.useCallback(() => {
        if (executionIdentifier) removeGeneration(executionIdentifier)
        setExecutionIdentifier(null)
    }, [executionIdentifier, removeGeneration])

    React.useEffect(() => {
        setModel(models.length > 0
            ? models.reduce((max, obj) => (obj?.tokenCost ?? 1) > (max?.tokenCost ?? 1) ? obj : max)?.identifier ?? undefined
            : undefined)
    }, [models])

    React.useEffect(
        () => setPromptState(prompt),
        [prompt, setPromptState]
    )

    return <motion.div
        layout
        initial={{opacity: 0, y: 25}}
        animate={{opacity: 1, y: 0}}
        transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8
        }}
    >
        <Card paddingSize={"xs"} color={"secondary"} w={"var(--radix-popper-anchor-width)"}>

            <Card color={"primary"} paddingSize={"xxs"} mx={-0.6} mt={-0.6} pos={"relative"}>
                {
                    models.length <= 0 && (
                        <Card color={"primary"}
                              paddingSize={"xxs"}
                              w={"100%"}
                              h={"100%"}
                              pos={"absolute"}
                              top={"0"}
                              left={"0"}
                              display={"flex"}
                              align={"center"}
                              justify={"center"}
                              bg={"rgba(7,5,20, 0.5)"}
                              style={{
                                  zIndex: 2,
                                  backdropFilter: "blur(0.25rem)",
                                  WebkitBackdropFilter: "blur(0.25rem)"
                              }}>
                            <ButtonGroup>
                                <Link href={"https://docs.codezero.build/"}>
                                    <Button paddingSize={"xxs"} color={"tertiary"} variant={"none"}>
                                        Learn how to enable AI
                                    </Button>
                                </Link>
                                <Link href={"https://docs.codezero.build/"}>
                                    <Button paddingSize={"xxs"} color={"tertiary"} variant={"none"}>
                                        Learn how to add AI models
                                    </Button>
                                </Link>
                            </ButtonGroup>
                        </Card>
                    )
                }
                {
                    aiLoading ? (
                        <div
                            style={{
                                padding: "0.7rem",
                                position: "relative",
                                overflow: "hidden",
                                height: "2.3rem",
                            }}
                        >
                            <AIGeneratingMessageComponent/>
                        </div>
                    ) : (
                        <EditorInput
                            key={prompt}
                            value={prompt}
                            onChange={(value) => {
                                setPromptState(value)
                            }}
                            wrapperComponent={{
                                style: {
                                    background: "transparent",
                                    boxShadow: "none"
                                }
                            }}
                            placeholder={"Describe what you want to edit..."}
                            language={StreamLanguage.define({
                                token(stream) {
                                    stream.next()
                                    return null;
                                }
                            })}/>
                    )
                }
                <Spacing spacing={"xxs"}/>
                <CardSection>
                    <Flex justify={"space-between"} align={"center"}>
                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                            <Select defaultValue={"generate"}>
                                <SelectTrigger w={"fit-content"} asChild>
                                    <Button paddingSize={"xxs"} variant={"none"}>
                                        <SelectValue placeholder={"Select mode"}/>
                                        <IconChevronDown size={13}/>
                                    </Button>
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value={"generate"}>
                                                <SelectItemText>
                                                    <Text>
                                                        Generate
                                                    </Text>
                                                </SelectItemText>
                                            </SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                            <Select value={model} onValueChange={setModel} key={models.length}>
                                <SelectTrigger w={"fit-content"} asChild>
                                    <Button paddingSize={"xxs"} variant={"none"}>
                                        <SelectValue placeholder={"Select modal"}/>
                                        <IconChevronDown size={13}/>
                                    </Button>
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectContent>
                                        <SelectViewport>
                                            {models.map((model) => (
                                                <SelectItem value={model?.identifier ?? ""}>
                                                    <SelectItemText>
                                                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                            <Text display={"flex"} align={"center"}
                                                                  style={{gap: "0.35rem"}}>
                                                                <IconSparkles2Filled size={13}/>
                                                                {model.name}
                                                            </Text>
                                                            <Text hierarchy={"tertiary"}>
                                                                ({model.tokenCost}x)
                                                            </Text>
                                                        </Flex>
                                                    </SelectItemText>
                                                </SelectItem>
                                            ))}
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </Flex>
                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                            {!aiLoading && aiErrorMessage ? (
                                <Text c={"#D90429"}>
                                    {aiErrorMessage}
                                </Text>
                            ) : null}
                            {aiLoading ? (
                                <Button onClick={onStop} color={"secondary"}>
                                    <IconPlayerStop size={13}/>
                                </Button>
                            ) : (
                                <Button onClick={onSend} variant={"none"} color={"secondary"}>
                                    <IconSend size={13}/>
                                </Button>
                            )}
                            {onClose ? (
                                <Button onClick={onClose} variant={"none"} color={"secondary"}>
                                    <IconX size={13}/>
                                </Button>
                            ) : null}
                        </Flex>
                    </Flex>
                </CardSection>
            </Card>

            <motion.div
                layout
                initial={{opacity: 0, y: 25}}
                animate={{opacity: 1, y: 0}}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    mass: 0.8
                }}
            >
                <Spacing spacing={"xs"}/>
                {
                    models.length > 0 ? (
                        <Flex align={"center"} justify={"space-between"} p={0.35} style={{gap: "0.35rem"}}>
                            <Text>
                                Upgrade your license to increase your AI usage limit
                            </Text>
                            <Progress w={"100px"} h={"7.5px"} value={0} max={100}
                                      color={"#70ffb2"}/>
                        </Flex>
                    ) : (
                        <Flex align={"center"} justify={"center"} p={0.35}>
                            <Text>
                                You currently don't have AI features enabled or don't have any models available
                            </Text>
                        </Flex>
                    )
                }
            </motion.div>
        </Card>
    </motion.div>
}