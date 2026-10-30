"use client"

import React from "react";
import {
    Avatar,
    Button,
    Flex,
    getSize,
    Icon,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Text
} from "@code0-tech/pictor";
import {
    IconArrowLeft,
    IconArrowsDiagonal,
    IconArrowsDiagonalMinimize2,
    IconDownload,
    IconInfoCircle,
    IconWifiOff
} from "@tabler/icons-react";
import {useSupportChat} from "@cloud-internal/support/hooks/Support.chat.hook";
import {supportChatService} from "@cloud-internal/support/services/Support.chat.service";
import {SupportChatHomeView} from "@cloud-internal/support/views/SupportChatHomeView";
import {SupportChatConversationView} from "@cloud-internal/support/views/SupportChatConversationView";
import {SupportChatConversationsView} from "@cloud-internal/support/views/SupportChatConversationsView";
import {USAGE_WARNING_COLOR} from "@core/util/usage";

export const SupportChatPanelView: React.FC = () => {

    const chat = useSupportChat()

    const notice = chat.settings?.notice_banner
    const conversation = chat.conversations.find(entry => entry.uuid === chat.currentUuid)
    const candidate = conversation?.assignee
    const assignee = candidate && candidate.id > 0 ? candidate : undefined
    const assigneeName = [assignee?.first_name, assignee?.last_name].filter(Boolean).join(" ")

    const officeHours = React.useMemo(() => {

        const minutesPerHour = 60
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const hours = chat.settings?.business_hours?.[0]

        if (!hours) return false
        if (hours.is_always_open) return true

        const offset = (chat.settings?.working_hours_utc_offset ?? 0) * minutesPerHour * 1000
        const deskNow = new Date(Date.now() + offset)
        const today = hours.hours?.[weekdays[deskNow.getUTCDay()]]

        if (!today?.open || !today?.close) return false

        const [openHour, openMinute] = today.open.split(":").map(Number)
        const [closeHour, closeMinute] = today.close.split(":").map(Number)
        const minutes = deskNow.getUTCHours() * minutesPerHour + deskNow.getUTCMinutes()

        return minutes >= openHour * minutesPerHour + openMinute
            && minutes < closeHour * minutesPerHour + closeMinute
    }, [chat.settings])

    const presence = React.useMemo(() => {

        const status = assignee?.availability_status

        if (status === "online") return "Online now"
        if (status?.startsWith("away")) return "Away"

        return officeHours ? "Online now" : "Outside office hours"
    }, [assignee, officeHours])

    const back = React.useCallback(() => {
        chat.leaveConversation()
        chat.setView("home")
    }, [chat])

    const transcript = React.useCallback(async () => {
        if (!chat.session || !conversation) return

        const blob = await supportChatService.downloadTranscript(chat.session.sessionToken, conversation.uuid)
            .catch(() => undefined)

        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")

        link.href = url
        link.download = `support-${conversation.uuid}.txt`
        link.click()

        URL.revokeObjectURL(url)
    }, [chat, conversation])

    return <Flex onKeyDown={event => event.stopPropagation()} style={{
        flexDirection: "column",
        overflow: "hidden",
        margin: `calc(-1 * ${getSize("xxs")})`,
        borderRadius: getSize("md"),
        width: `calc(100% + 2 * ${getSize("xxs")})`,
        height: `min(calc(100dvh - 8rem), 40rem)`
    }}>
        <Flex align={"center"} justify={"space-between"} style={{
            gap: getSize("sm"),
            padding: getSize("sm"),
            borderBottom: "1px solid rgba(191, 191, 191, 0.1)"
        }}>
            <Flex align={"center"} style={{gap: getSize("sm"), minWidth: 0}}>
                {chat.view === "home" ? null :
                    <Button color={"secondary"} style={{padding: getSize("xxs")}} onClick={back}>
                        <IconArrowLeft size={14}/>
                    </Button>}
                {assignee
                    ? <Avatar identifier={assignee.avatar_url ? undefined : assigneeName || "Support"}
                              src={assignee.avatar_url ?? undefined} type={"character"} size={28}
                              style={{borderRadius: "100%"}}/>
                    : <Icon icon={"codezero:codezero"} color={"#fff"} size={28}/>}
                <div style={{minWidth: 0}}>
                    <Text size={"md"}>{assigneeName || chat.settings?.brand_name}</Text>
                    <Text size={"sm"} hierarchy={"tertiary"}>{presence}</Text>
                </div>
            </Flex>
            <Flex align={"center"} style={{gap: getSize("xxs")}}>
                {conversation && chat.settings?.features.transcript
                    ? <Button color={"secondary"} style={{padding: getSize("xxs")}} onClick={transcript}>
                        <IconDownload size={14}/>
                    </Button>
                    : null}
                <Button color={"secondary"} style={{padding: getSize("xxs")}} onClick={chat.toggleExpanded}>
                    {chat.expanded ? <IconArrowsDiagonalMinimize2 size={14}/> : <IconArrowsDiagonal size={14}/>}
                </Button>
            </Flex>
        </Flex>

        {notice?.enabled && notice.text
            ? <Flex align={"center"} style={{
                gap: getSize("xs"),
                padding: `${getSize("xs")} ${getSize("sm")}`,
                background: "rgba(191, 191, 191, 0.08)"
            }}>
                <IconInfoCircle size={13} style={{minWidth: "13px"}}/>
                <Text size={"sm"}>{notice.text}</Text>
            </Flex>
            : null}

        {chat.connection === "online" ? null : <Flex align={"center"} style={{
            gap: getSize("xs"),
            padding: `${getSize("xs")} ${getSize("sm")}`,
            background: "#201813"
        }}>
            <IconWifiOff size={13} color={USAGE_WARNING_COLOR} style={{minWidth: "13px"}}/>
            <Text size={"sm"}>
                {chat.connection === "connecting" ? "Connecting…" : "Reconnecting, messages may be delayed"}
            </Text>
        </Flex>}

        {chat.view === "conversation"
            ? <SupportChatConversationView/>
            : <ScrollArea type={"scroll"} style={{flex: 1, minHeight: 0}}>
                <ScrollAreaViewport>
                    {chat.view === "home" ? <SupportChatHomeView/> : null}
                    {chat.view === "conversations" ? <SupportChatConversationsView/> : null}
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation={"vertical"}>
                    <ScrollAreaThumb/>
                </ScrollAreaScrollbar>
            </ScrollArea>}
    </Flex>
}
