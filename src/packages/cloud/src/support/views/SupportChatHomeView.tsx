"use client"

import React from "react";
import {Badge, Button, Flex, getSize, Spacing, Text} from "@code0-tech/pictor";
import {IconMessagePlus} from "@tabler/icons-react";
import {useSupportChat} from "@cloud-internal/support/hooks/Support.chat.hook";
import {
    SupportChatConversationCardComponent
} from "@cloud-internal/support/components/SupportChatConversationCardComponent";
import {groupSupportConversations} from "@cloud-internal/support/utils/Support.chat.util";

export const SupportChatHomeView: React.FC = () => {

    const chat = useSupportChat()

    const settings = chat.settings

    const greeting = React.useMemo(() => {

        const placeholder = /\{\{\s*\.(\w+)\s*(?:\|\s*([^}]*?)\s*)?}}/g
        const fields: Record<string, string | undefined> = {FirstName: chat.session?.user.first_name}

        return (settings?.greeting_message ?? "")
            .replace(placeholder, (_, field: string, fallback: string) => fields[field] || fallback || "")
            .trim()
    }, [settings, chat.session])

    const {active} = React.useMemo(() => groupSupportConversations(chat.conversations), [chat.conversations])

    const blocked = React.useMemo(() => !settings?.users.allow_start_conversation
        || (settings.users.prevent_multiple_conversations && active.length > 0), [settings, active])

    const start = React.useCallback(() => {
        chat.leaveConversation()
        chat.setView("conversation")
    }, [chat])

    const open = React.useCallback((uuid: string) => {
        chat.openConversation(uuid)
        chat.setView("conversation")
    }, [chat])

    return <Flex style={{flexDirection: "column", minHeight: "100%", padding: getSize("md")}}>
        <Text size={"lg"}>{greeting}</Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            {settings?.introduction_message} {" "}
            {settings?.chat_introduction}
        </Text>
        <Spacing spacing={"md"}/>
        {active.length ? <>
            <Flex align={"center"} justify={"space-between"}>
                <Text hierarchy={"tertiary"}>
                    Your conversations
                </Text>
                <Badge color={"secondary"}>
                    {active.length}
                </Badge>
            </Flex>
            <Spacing spacing={"xs"}/>
            {active.slice(0, 3).map(conversation => <React.Fragment key={conversation.uuid}>
                <SupportChatConversationCardComponent conversation={conversation} onOpen={open}/>
                <Spacing spacing={"xs"}/>
            </React.Fragment>)}
        </> : null}

        {chat.conversations.length > active.length || active.length > 3
            ? <>
                <Flex justify={"flex-end"}>
                    <Button variant={"none"} paddingSize={"xxs"}
                            onClick={() => chat.setView("conversations")}>
                        <Text hierarchy={"tertiary"}>
                            {`Show all ${chat.conversations.length} conversations`}
                        </Text>
                    </Button>
                </Flex>
                <Spacing spacing={"md"}/>
            </>
            : null}

        <div style={{marginTop: "auto"}}>
            {blocked ? null : <>
                <Button color={"secondary"} justify={"center"} w={"100%"} onClick={start}>
                    <IconMessagePlus size={14}/>
                    {settings?.users.start_conversation_button_text || "Start conversation"}
                </Button>
                <Spacing spacing={"sm"}/>
            </>}

            {settings?.show_office_hours_in_chat && settings.chat_reply_expectation_message
                ? <Text size={"sm"} hierarchy={"tertiary"} ta={"center"}>
                    {settings.chat_reply_expectation_message}
                </Text>
                : null}
        </div>
    </Flex>
}
