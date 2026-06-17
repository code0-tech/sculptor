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
import {IconChevronDown, IconSend, IconSparkles2Filled} from "@tabler/icons-react";
import {AIService} from "@edition/ai/services/AI.service";
import {motion} from "framer-motion";

export interface AIChatComponentProps {
    onPrompt?: (value: string) => void
    prompt?: string
}

export const AIChatComponent: React.FC<AIChatComponentProps> = (props) => {

    const {onPrompt, prompt = ""} = props

    const [promptState, setPromptState] = React.useState<string>(prompt)
    const aiService = useService(AIService)
    const aiStore = useStore(AIService)

    const models = React.useMemo(
        () => aiService.values(),
        [aiStore]
    )

    const onSend = React.useCallback(() => {

    }, [])

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
                <EditorInput
                    value={promptState}
                    onChange={(value) => onPrompt?.(value)}
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
                            <Select key={models.length} defaultValue={
                                models.length > 0
                                    ? models.reduce((max, obj) => (obj?.tokenCost ?? 1) > (max?.tokenCost ?? 1) ? obj : max)?.identifier ?? undefined
                                    : undefined
                            }>
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
                            <Button variant={"none"} color={"secondary"}>
                                <IconSend size={13}/>
                            </Button>
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