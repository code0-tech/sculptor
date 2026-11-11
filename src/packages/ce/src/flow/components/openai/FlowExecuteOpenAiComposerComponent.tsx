import React from "react";
import {
    Button,
    Card,
    Flex,
    getSize,
    Input,
    SelectContent,
    SelectInput,
    SelectItem,
    SelectItemText,
    SelectPortal,
    SelectTrigger,
    SelectValue,
    SelectViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {IconChevronDown, IconPaperclip, IconSend, IconTool, IconX} from "@tabler/icons-react";
import {Flow} from "@code0-tech/sagittarius-graphql-types";
import {OpenAiChat} from "@edition/flow/hooks/FlowExecuteOpenAi.chat.hook";

export interface FlowExecuteOpenAiComposerComponentProps {
    chat: OpenAiChat
}

export const FlowExecuteOpenAiComposerComponent: React.FC<FlowExecuteOpenAiComposerComponentProps> = (props) => {

    const {chat} = props

    const file = React.useRef<HTMLInputElement>(null)

    const sendable = !chat.waiting && (!!chat.prompt.trim() || chat.attachments.length > 0) && chat.executable

    return <Card color={"primary"} paddingSize={"xxs"}>
        {chat.attachments.length > 0 ? <>
            <Flex align={"center"} style={{gap: getSize("xxs"), flexWrap: "wrap"}}>
                {chat.attachments.map((attachment, index) => (
                    <Card color={"secondary"} paddingSize={"xxs"} key={`${attachment.name}-${index}`}>
                        <Flex align={"center"} style={{gap: getSize("xs")}}>
                            <Text size={"sm"} style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "8rem"
                            }}>
                                {attachment.name}
                            </Text>
                            <Button variant={"none"} color={"secondary"}
                                    style={{padding: getSize("xxs")}}
                                    onClick={() => chat.detach(index)}>
                                <IconX size={11}/>
                            </Button>
                        </Flex>
                    </Card>
                ))}
            </Flex>
            <Spacing spacing={"xxs"}/>
        </> : null}
        <Input type={"textarea"} rows={2} value={chat.prompt}
               placeholder={chat.toolCall
                   ? `Answer ${chat.toolCall.function.name}...`
                   : "Ask this workflow something..."}
               data-qa-selector={"flow-builder-manual-execution-chat-input"}
               wrapperComponent={{style: {background: "transparent", boxShadow: "none"}}}
               onChange={event => chat.setPrompt(event.target.value)}
               onKeyDown={event => {
                   if (event.key !== "Enter" || event.shiftKey) return
                   event.preventDefault()
                   chat.send()
               }}/>
        <Spacing spacing={"xxs"}/>
        <CardSection>
            <Flex align={"center"} justify={"space-between"} style={{gap: getSize("xs")}}>
                <Flex align={"center"} style={{gap: "0.35rem"}}>
                    <SelectInput value={chat.targetFlowId ?? undefined} key={chat.models.length}
                                 onValueChange={value => chat.setTargetFlowId(value as Flow['id'])}>
                        <SelectTrigger w={"fit-content"} asChild>
                            <Button variant={"none"} paddingSize={"xxs"} color={"secondary"}>
                                <SelectValue placeholder={"No model name set"}/>
                                <IconChevronDown size={13}/>
                            </Button>
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectContent>
                                <SelectViewport>
                                    {chat.models.map(candidate => (
                                        <SelectItem value={candidate.flowId!} key={candidate.flowId}>
                                            <SelectItemText>
                                                <Text>{candidate.name}</Text>
                                            </SelectItemText>
                                        </SelectItem>
                                    ))}
                                </SelectViewport>
                            </SelectContent>
                        </SelectPortal>
                    </SelectInput>
                    <Button variant={"none"} color={"secondary"} style={{padding: getSize("xs")}}
                            onClick={() => file.current?.click()}>
                        <IconPaperclip size={13}/>
                    </Button>
                    <input ref={file} type={"file"} multiple hidden
                           onChange={event => {
                               chat.attach(Array.from(event.target.files ?? []))
                               event.target.value = ""
                           }}/>
                    {chat.toolCall ? <Card color={"secondary"} paddingSize={"xxxs"}>
                        <Flex align={"center"} style={{gap: getSize("xxxs")}}>
                            <IconTool size={11}/>
                            <Text size={"xs"}>{chat.toolCall.function.name}</Text>
                            <Button variant={"none"} color={"secondary"}
                                    style={{padding: getSize("xxs")}}
                                    onClick={() => chat.setToolCall(undefined)}>
                                <IconX size={11}/>
                            </Button>
                        </Flex>
                    </Card> : null}
                    {!chat.toolCall && chat.openToolCalls.length > 0 ? <Text size={"xs"} hierarchy={"tertiary"}>
                        {`${chat.openToolCalls.length} open tool call${chat.openToolCalls.length > 1 ? "s" : ""}`}
                    </Text> : null}
                </Flex>
                <Button variant={"none"} color={"secondary"} style={{padding: getSize("xs")}}
                        disabled={!sendable}
                        data-qa-selector={"flow-builder-manual-execution-chat-trigger"}
                        onClick={chat.send}>
                    <IconSend size={13}/>
                </Button>
            </Flex>
        </CardSection>
    </Card>
}
