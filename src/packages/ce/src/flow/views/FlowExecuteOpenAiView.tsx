import React from "react";
import {
    Button,
    Card,
    Flex,
    getSize,
    Icon,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {IconLoader2, IconTrash} from "@tabler/icons-react";
import {motion} from "framer-motion";
import {useOpenAiChat} from "@edition/flow/hooks/FlowExecuteOpenAi.chat.hook";
import {
    FlowExecuteOpenAiMessageComponent
} from "@edition/flow/components/openai/FlowExecuteOpenAiMessageComponent";
import {
    FlowExecuteOpenAiComposerComponent
} from "@edition/flow/components/openai/FlowExecuteOpenAiComposerComponent";
import "./FlowExecuteOpenAiView.style.scss";

export const FlowExecuteOpenAiView: React.FC = () => {

    const chat = useOpenAiChat()

    const scroll = React.useRef<HTMLDivElement>(null)
    const [rawId, setRawId] = React.useState<string | undefined>(undefined)

    React.useEffect(() => {
        const viewport = scroll.current?.querySelector<HTMLDivElement>("[data-radix-scroll-area-viewport]")
        viewport?.scrollTo({top: viewport.scrollHeight, behavior: "smooth"})
    }, [chat.entries, chat.waiting])

    return <div data-qa-selector={"flow-builder-manual-execution-chat"}>
        <Flex align={"center"} justify={"space-between"}>
            <Flex align={"center"} style={{gap: getSize("xs")}}>
                <Icon icon={chat.icon} color={"#fff"} size={16}/>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    {chat.route ? `Chat request on ${chat.route}` : "Chat request"}
                </Text>
            </Flex>
            <Button variant={"none"} color={"secondary"} style={{padding: getSize("xs")}}
                    disabled={chat.entries.length <= 0 || chat.waiting}
                    onClick={chat.clear}>
                <IconTrash size={13}/>
            </Button>
        </Flex>
        <Spacing spacing={"xs"}/>
        <div ref={scroll} style={{height: "18rem", display: "flex"}}>
            <ScrollArea type={"scroll"} w={"100%"} h={"100%"}>
                <ScrollAreaViewport>
                    {chat.entries.length <= 0 && !chat.waiting ? <Flex align={"center"} justify={"center"} h={"18rem"}
                                                                       style={{
                                                                           textAlign: "center",
                                                                           flexDirection: "column"
                                                                       }}>
                        <Text hierarchy={"tertiary"}>
                            Send a message to execute this workflow
                        </Text>
                        <Spacing spacing={"xxs"}/>
                        <Text size={"sm"} hierarchy={"tertiary"}>
                            Every message is sent as the chat request an OpenAI client would make,
                            together with the messages before it.
                        </Text>
                    </Flex> : null}

                    {chat.entries.map((entry, index) => <React.Fragment key={entry.id}>
                        {index ? <Spacing spacing={"sm"}/> : null}
                        <FlowExecuteOpenAiMessageComponent entry={entry}
                                                           icon={chat.icon}
                                                           waiting={chat.waiting}
                                                           rawOpen={rawId === entry.id}
                                                           onAnswer={chat.setToolCall}
                                                           onToggleRaw={() =>
                                                               setRawId(rawId === entry.id ? undefined : entry.id)}/>
                    </React.Fragment>)}

                    {chat.waiting ? <>
                        {chat.entries.length ? <Spacing spacing={"sm"}/> : null}
                        <Flex align={"flex-end"} style={{gap: getSize("xs")}}>
                            <Icon icon={chat.icon} color={"#fff"} size={24} style={{minWidth: "24px"}}/>
                            <Card color={"primary"} paddingSize={"xs"} display={"inline-block"}
                                  style={{borderRadius: getSize("md"), borderTopLeftRadius: getSize("xxs")}}>
                                <Flex align={"center"} style={{gap: getSize("xxs")}}>
                                    <motion.div style={{display: "flex"}}
                                                animate={{rotate: 360}}
                                                transition={{duration: 1, ease: "linear", repeat: Infinity}}>
                                        <IconLoader2 size={13}/>
                                    </motion.div>
                                    <Text size={"sm"} hierarchy={"tertiary"}>
                                        Executing...
                                    </Text>
                                </Flex>
                            </Card>
                        </Flex>
                    </> : null}
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation={"vertical"}>
                    <ScrollAreaThumb/>
                </ScrollAreaScrollbar>
            </ScrollArea>
        </div>
        <Spacing spacing={"xs"}/>
        <FlowExecuteOpenAiComposerComponent chat={chat}/>
        <Spacing spacing={"xxs"}/>
        <Text hierarchy={"tertiary"} display={"block"} style={{textAlign: "center"}}>
            {chat.executable
                ? "Enter sends, shift + enter adds a line. \n AI can make mistakes, please double-check responses."
                : "This project has no primary runtime to execute on"}
        </Text>
    </div>
}
