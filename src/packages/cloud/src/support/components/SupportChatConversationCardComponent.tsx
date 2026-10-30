"use client"

import React from "react";
import {Avatar, Badge, Card, Flex, getSize, Icon, Text} from "@code0-tech/pictor";
import {IconChevronRight} from "@tabler/icons-react";
import {SupportConversation} from "@cloud-internal/support/services/Support.chat.types";

export interface SupportChatConversationCardComponentProps {
    conversation: SupportConversation
    onOpen: (uuid: string) => void
}

export const SupportChatConversationCardComponent: React.FC<SupportChatConversationCardComponentProps> = (props) => {

    const {conversation, onOpen} = props

    const candidate = conversation.assignee
    const assignee = candidate && candidate.id > 0 ? candidate : undefined
    const name = [assignee?.first_name, assignee?.last_name].filter(Boolean).join(" ")
    const stamp = conversation.last_message?.created_at ?? conversation.created_at
    const settled = conversation.status === "Resolved" || conversation.status === "Closed"

    return <Card color={"secondary"} variant={"filled"} paddingSize={"sm"} clickable
                 style={{
                     boxShadow: "none",
                     opacity: settled ? 0.5 : 1
                 }}
                 onClick={() => onOpen(conversation.uuid)}>
        <Flex align={"center"} justify={"space-between"} style={{gap: getSize("sm")}}>
            <Flex align={"center"} style={{gap: getSize("sm"), minWidth: 0}}>
                {assignee
                    ? <Avatar identifier={assignee.avatar_url ? undefined : name || "Support"}
                              src={assignee.avatar_url ?? undefined} type={"character"} size={28}
                              style={{borderRadius: "100%"}}/>
                    : <Icon icon={"codezero:codezero"} color={"#fff"} size={28}/>}
                <div style={{minWidth: 0}}>
                    <Text size={"md"} style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}>
                        {conversation.last_message?.content || "New conversation"}
                    </Text>
                    <Text hierarchy={"tertiary"}>
                        {`Status: ${conversation.status}, ${new Date(stamp).toLocaleDateString()}`}
                    </Text>
                </div>
            </Flex>
            <Flex align={"center"} style={{gap: getSize("xs")}}>
                {conversation.unread_message_count
                    ? <Badge color={"info"}>{conversation.unread_message_count}</Badge>
                    : null}
                <IconChevronRight size={14}/>
            </Flex>
        </Flex>
    </Card>
}
