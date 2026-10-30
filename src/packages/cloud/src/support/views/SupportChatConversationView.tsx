"use client"

import React from "react";
import {
    Avatar,
    Button,
    Card,
    Flex,
    getSize,
    Icon,
    Input,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {IconArrowDown, IconPaperclip, IconSend} from "@tabler/icons-react";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {useSupportChat} from "@cloud-internal/support/hooks/Support.chat.hook";
import {SupportChatMessageComponent} from "@cloud-internal/support/components/SupportChatMessageComponent";

export const SupportChatConversationView: React.FC = () => {

    const chat = useSupportChat()

    const scrollRef = React.useRef<HTMLDivElement>(null)
    const fileRef = React.useRef<HTMLInputElement>(null)
    const [atBottom, setAtBottom] = React.useState(true)
    const [message, setMessage] = React.useState("")
    const [files, setFiles] = React.useState<File[]>([])

    const conversation = chat.conversations.find(entry => entry.uuid === chat.currentUuid)
    const settled = conversation?.status === "Resolved" || conversation?.status === "Closed"
    const typing = !!chat.typingUuid && chat.typingUuid === chat.currentUuid
    const candidate = conversation?.assignee
    const assignee = candidate && candidate.id > 0 ? candidate : undefined
    const assigneeName = [assignee?.first_name, assignee?.last_name].filter(Boolean).join(" ")
    const started = !!chat.currentUuid
    const bottomThreshold = 40

    const groups = React.useMemo(() => {

        const dividerDistance = 30 * 60 * 1000
        const groupDistance = 5 * 60 * 1000

        return chat.messages.map((entry, index) => {

            const previous = chat.messages[index - 1]
            const next = chat.messages[index + 1]
            const stamp = new Date(entry.created_at)
            const created = stamp.getTime()
            const sincePrevious = previous ? created - new Date(previous.created_at).getTime() : Number.MAX_SAFE_INTEGER
            const untilNext = next ? new Date(next.created_at).getTime() - created : Number.MAX_SAFE_INTEGER
            const time = stamp.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
            const date = stamp.toLocaleDateString([], {day: "2-digit", month: "2-digit"})

            return {
                message: entry,
                divided: sincePrevious > dividerDistance,
                dividerLabel: stamp.toDateString() === new Date().toDateString() ? time : `${date} · ${time}`,
                continued: previous?.author?.type === entry.author?.type
                    && previous?.author?.id === entry.author?.id
                    && sincePrevious < groupDistance,
                groupedWithNext: next?.author?.type === entry.author?.type
                    && next?.author?.id === entry.author?.id
                    && untilNext < groupDistance,
                last: !next
            }
        })
    }, [chat.messages])

    const viewport = React.useCallback(() =>
        scrollRef.current?.querySelector<HTMLDivElement>("[data-radix-scroll-area-viewport]"), [])

    const scrollToBottom = React.useCallback(() => {
        const target = viewport()
        target?.scrollTo({top: target.scrollHeight, behavior: "smooth"})
    }, [viewport])

    const quickReply = React.useCallback(async (reply: string) => {
        try {
            await chat.startConversation(reply)
        } catch {
            toast({title: "Conversation could not be started", color: "error"})
        }
    }, [chat])

    const change = React.useCallback((value: string) => {
        setMessage(value)
        chat.reportTyping(!!value)
    }, [chat])

    const submit = React.useCallback(async () => {

        if ((!message.trim() && !files.length) || chat.sending) return

        const content = message

        setMessage("")
        setFiles([])
        chat.reportTyping(false)

        try {
            if (started) await chat.sendMessage(content, files)
            else await chat.startConversation(content)
        } catch {
            toast({title: "Message could not be sent", color: "error"})
        }
    }, [chat, message, files, started])

    React.useEffect(() => {
        if (!atBottom) return
        const target = viewport()
        target?.scrollTo({top: target.scrollHeight})
    }, [groups, atBottom, viewport])

    return <Flex style={{flexDirection: "column", flex: 1, minHeight: 0}}>
        <div ref={scrollRef} style={{flex: 1, minHeight: 0, display: "flex", position: "relative"}}>
            <ScrollArea type={"scroll"} w={"100%"} h={"100%"}>
                <ScrollAreaViewport onScroll={event => {
                    const target = event.currentTarget
                    setAtBottom(target.scrollHeight - target.scrollTop - target.clientHeight < bottomThreshold)
                }}>
                    <div style={{padding: getSize("md")}}>
                        <Flex justify={"center"}>
                            <Text size={"sm"} hierarchy={"tertiary"}>{chat.settings?.chat_introduction}</Text>
                        </Flex>
                        <Spacing spacing={"xs"}/>
                        {!conversation ? <>
                            <Spacing spacing={"sm"}/>
                            {(chat.settings?.users.quick_replies ?? []).map(reply => <React.Fragment key={reply}>
                                <Flex justify={"flex-end"}>
                                    <Card color={"info"} paddingSize={"xs"} display={"inline-block"} clickable
                                          onClick={() => quickReply(reply)}>
                                        <Text>
                                            {reply}
                                        </Text>
                                    </Card>
                                </Flex>
                                <Spacing spacing={"xs"}/>
                            </React.Fragment>)}
                        </> : null}

                        {groups.map(group => <React.Fragment key={group.message.uuid}>
                            {group.divided ? <>
                                <Flex justify={"center"}>
                                    <Text size={"sm"} hierarchy={"tertiary"}>{group.dividerLabel}</Text>
                                </Flex>
                                <Spacing spacing={"sm"}/>
                            </> : null}
                            <SupportChatMessageComponent message={group.message} continued={group.continued}/>
                            {group.last ? null : <Spacing spacing={group.groupedWithNext ? "xxs" : "sm"}/>}
                        </React.Fragment>)}

                        {settled ? <>
                            {groups.length ? <Spacing spacing={"sm"}/> : null}
                            <Text size={"sm"} hierarchy={"tertiary"} ta={"center"}>
                                {conversation?.status === "Resolved"
                                    ? "This conversation was resolved."
                                    : "This conversation was closed."}
                            </Text>
                        </> : null}
                    </div>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation={"vertical"}>
                    <ScrollAreaThumb/>
                </ScrollAreaScrollbar>
            </ScrollArea>

            {typing ? <Flex align={"center"} style={{
                gap: getSize("xs"),
                position: "absolute",
                left: getSize("md"),
                bottom: getSize("xs"),
                pointerEvents: "none"
            }}>
                {assignee
                    ? <Avatar identifier={assignee.avatar_url ? undefined : assigneeName || "Support"}
                              src={assignee.avatar_url ?? undefined} type={"character"} size={24}
                              style={{borderRadius: "100%", minWidth: "24px"}}/>
                    : <Icon icon={"codezero:codezero"} color={"#fff"} size={24} style={{minWidth: "24px"}}/>}
                <Flex>
                    <Text size={"sm"} hierarchy={"tertiary"}>
                        {assignee?.first_name ? `${assignee.first_name} is typing…` : "Typing…"}
                    </Text>
                </Flex>
            </Flex> : null}
        </div>

        {atBottom ? null : <Flex justify={"center"} style={{
            paddingBottom: getSize("xs"),
            marginTop: `calc(-1 * (${getSize("xl")} + ${getSize("xs")}))`
        }}>
            <Button color={"tertiary"} style={{padding: getSize("xxs")}} onClick={scrollToBottom}>
                <IconArrowDown size={14}/>
            </Button>
        </Flex>}

        {settled ? <div style={{padding: getSize("sm"), borderTop: "1px solid rgba(191, 191, 191, 0.1)"}}>
            <Button color={"secondary"} justify={"center"} w={"100%"} onClick={chat.leaveConversation}>
                Start a new conversation
            </Button>
        </div> : null}

        {settled ? null : <div style={{padding: getSize("sm"), borderTop: "1px solid rgba(191, 191, 191, 0.1)"}}>
            <Input type={"textarea"} rows={2} placeholder={"Type a message"} value={message}
                   wrapperComponent={{style: {background: "transparent", boxShadow: "none"}}}
                   onChange={event => change(event.target.value)}
                   onKeyDown={event => {
                       if (event.key !== "Enter" || event.shiftKey) return
                       event.preventDefault()
                       submit()
                   }}/>
            <Spacing spacing={"xxs"}/>
            <Flex align={"center"} justify={"space-between"}>
                <Flex align={"center"} style={{gap: "0.35rem"}}>
                    {chat.settings?.features.file_upload && started ? <>
                        <Button variant={"none"} color={"secondary"} style={{padding: getSize("xxs")}}
                                onClick={() => fileRef.current?.click()}>
                            <IconPaperclip size={13}/>
                        </Button>
                        <input ref={fileRef} type={"file"} multiple hidden
                               onChange={event => setFiles(Array.from(event.target.files ?? []))}/>
                    </> : null}
                    {files.length ? <Text hierarchy={"tertiary"}>
                        {files.map(file => file.name.length > 10 ? `${file.name.slice(0, 10)}…` : file.name).join(", ")}
                    </Text> : null}
                </Flex>
                <Button variant={"none"} color={"secondary"} style={{padding: getSize("xxs")}}
                        disabled={chat.sending || (!message.trim() && !files.length)} onClick={submit}>
                    <IconSend size={13}/>
                </Button>
            </Flex>
        </div>}
    </Flex>
}
