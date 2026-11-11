import React from "react";
import {Button, Card, Flex, getSize, Icon, IconString, Spacing, Text} from "@code0-tech/pictor";
import {IconAlertTriangle, IconBraces, IconFile, IconTool} from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {ChatEntry, ChatToolCall} from "@edition/flow/utils/FlowExecuteOpenAi.chat.util";
import {
    FlowExecuteOpenAiDetailsComponent
} from "@edition/flow/components/openai/FlowExecuteOpenAiDetailsComponent";

export interface FlowExecuteOpenAiMessageComponentProps {
    entry: ChatEntry
    icon: IconString
    waiting: boolean
    rawOpen: boolean
    onAnswer: (toolCall: ChatToolCall) => void
    onToggleRaw: () => void
}

export const FlowExecuteOpenAiMessageComponent: React.FC<FlowExecuteOpenAiMessageComponentProps> = (props) => {

    const {entry, icon, waiting, rawOpen, onAnswer, onToggleRaw} = props

    const own = entry.message.role === "user"
    const content = entry.message.content
    const text = typeof content === "string" ? content : (Array.isArray(content) ? content
        .filter(part => part.type === "text" && typeof part.text === "string")
        .map(part => part.text as string)
        .join("\n") : "")
    const parts = Array.isArray(content) ? content.filter(part => part.type !== "text") : []
    const usage = [
        entry.usage?.prompt_tokens ? `${entry.usage.prompt_tokens} in` : undefined,
        entry.usage?.completion_tokens ? `${entry.usage.completion_tokens} out` : undefined,
        entry.usage?.total_tokens ? `${entry.usage.total_tokens} total` : undefined
    ].filter(Boolean).join(" · ")
    const assistant = entry.message.role === "assistant" || entry.message.role === "tool"

    return <Flex align={"flex-end"} style={{gap: getSize("xs"), flexDirection: own ? "row-reverse" : "row"}}>
        {own ? null : <div style={{width: "24px", minWidth: "24px"}}>
            {entry.message.role === "tool"
                ? <IconTool size={16}/>
                : <Icon icon={icon} color={"#fff"} size={24}/>}
        </div>}
        <div style={{maxWidth: "78%", textAlign: own ? "right" : "left"}}>
            {assistant ? <>
                <Text size={"xs"} hierarchy={"tertiary"}>
                    {entry.message.role === "tool"
                        ? `Tool result${entry.message.name ? ` · ${entry.message.name}` : ""}`
                        : "Assistant"}
                </Text>
                <Spacing spacing={"xxxs"}/>
            </> : null}

            {entry.reasoning ? <>
                <Text size={"sm"} hierarchy={"tertiary"}
                      style={{whiteSpace: "pre-wrap", wordBreak: "break-word", textAlign: "left"}}>
                    {entry.reasoning}
                </Text>
                <Spacing spacing={"xxs"}/>
            </> : null}

            {text || entry.error || parts.length <= 0 ? <Card color={own ? "info" : "primary"}
                                                              paddingSize={"xs"}
                                                              display={"inline-block"}
                                                              style={{
                                                                  textAlign: "left",
                                                                  borderRadius: getSize("md"),
                                                                  borderTopRightRadius: own ? getSize("xxs") : undefined,
                                                                  borderTopLeftRadius: own ? undefined : getSize("xxs")
                                                              }}>
                {entry.error ? <Flex align={"center"} style={{gap: getSize("xxs")}}>
                    <IconAlertTriangle size={13} style={{minWidth: "13px"}}/>
                    <Text size={"sm"} style={{wordBreak: "break-word"}}>{entry.error}</Text>
                </Flex> : null}
                {!entry.error && own ? <Text style={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
                    {text}
                </Text> : null}
                {!entry.error && !own ? <div className={"openai-chat-markdown"}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                </div> : null}
            </Card> : null}

            {parts.map((part, partIndex) => {
                const image = part.image_url as {url?: string} | undefined

                return <React.Fragment key={`${entry.id}-part-${partIndex}`}>
                    <Spacing spacing={"xxs"}/>
                    {part.type === "image_url" && image?.url
                        ? <img src={image.url} alt={"Attachment"}
                               style={{
                                   display: "block",
                                   maxWidth: "100%",
                                   maxHeight: "10rem",
                                   borderRadius: getSize("xs")
                               }}/>
                        : <Card color={"primary"} paddingSize={"xs"} display={"inline-block"}>
                            <Flex align={"center"} style={{gap: getSize("xs")}}>
                                <IconFile size={13} style={{minWidth: "13px"}}/>
                                <Text size={"sm"} style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: "10rem"
                                }}>
                                    {part.type === "image_url" ? "Image" : (part.type === "input_audio"
                                        ? "Audio"
                                        : ((part.file as {filename?: string} | undefined)?.filename ?? part.type))}
                                </Text>
                            </Flex>
                        </Card>}
                </React.Fragment>
            })}

            <FlowExecuteOpenAiDetailsComponent entry={entry}
                                               waiting={waiting}
                                               rawOpen={rawOpen}
                                               onAnswer={onAnswer}/>

            {entry.model || usage || entry.finishReason || entry.raw ? <>
                <Spacing spacing={"xxxs"}/>
                <Flex align={"center"}
                      style={{gap: getSize("xxs"), justifyContent: own ? "flex-end" : "flex-start"}}>
                    <Text size={"xs"} hierarchy={"tertiary"}>
                        {[entry.model, entry.finishReason, usage].filter(Boolean).join(" · ")}
                    </Text>
                    {entry.raw ? <Button variant={"none"} color={"secondary"}
                                         style={{padding: getSize("xxs")}}
                                         onClick={onToggleRaw}>
                        <IconBraces size={11}/>
                    </Button> : null}
                </Flex>
            </> : null}
        </div>
    </Flex>
}
