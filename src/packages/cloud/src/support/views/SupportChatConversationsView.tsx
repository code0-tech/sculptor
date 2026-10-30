"use client"

import React from "react";
import {getSize, Spacing, Text} from "@code0-tech/pictor";
import {useSupportChat} from "@cloud-internal/support/hooks/Support.chat.hook";
import {
    SupportChatConversationCardComponent
} from "@cloud-internal/support/components/SupportChatConversationCardComponent";
import {groupSupportConversations} from "@cloud-internal/support/utils/Support.chat.util";

export const SupportChatConversationsView: React.FC = () => {

    const chat = useSupportChat()

    const {active, settled} = React.useMemo(() => groupSupportConversations(chat.conversations), [chat.conversations])

    const open = React.useCallback((uuid: string) => {
        chat.openConversation(uuid)
        chat.setView("conversation")
    }, [chat])

    return <div style={{padding: getSize("md")}}>
        {chat.conversations.length ? null : <Text size={"md"} hierarchy={"tertiary"}>No conversations yet.</Text>}

        {active.length ? <>
            <Text hierarchy={"tertiary"}>
                Open
            </Text>
            <Spacing spacing={"xs"}/>
            {active.map(conversation => <React.Fragment key={conversation.uuid}>
                <SupportChatConversationCardComponent conversation={conversation} onOpen={open}/>
                <Spacing spacing={"xs"}/>
            </React.Fragment>)}
            <Spacing spacing={"sm"}/>
        </> : null}

        {settled.length ? <>
            <Text hierarchy={"tertiary"}>
                Resolved and closed
            </Text>
            <Spacing spacing={"xs"}/>
            {settled.map(conversation => <React.Fragment key={conversation.uuid}>
                <SupportChatConversationCardComponent conversation={conversation} onOpen={open}/>
                <Spacing spacing={"xs"}/>
            </React.Fragment>)}
        </> : null}
    </div>
}
