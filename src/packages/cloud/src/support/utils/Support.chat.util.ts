import {SupportConversation} from "@cloud-internal/support/services/Support.chat.service";

export interface SupportConversationGroups {
    active: SupportConversation[]
    settled: SupportConversation[]
}

export const groupSupportConversations = (conversations: SupportConversation[]): SupportConversationGroups => {

    const sorted = conversations.slice().sort((first, second) =>
        new Date(second.last_message?.created_at ?? second.created_at).getTime()
        - new Date(first.last_message?.created_at ?? first.created_at).getTime())

    return {
        active: sorted.filter(conversation => conversation.status === "Open" || conversation.status === "Snoozed"),
        settled: sorted.filter(conversation => conversation.status === "Resolved" || conversation.status === "Closed")
    }
}
