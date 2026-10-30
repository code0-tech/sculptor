"use client"

import {create} from "zustand"
import {supportChatService} from "@cloud-internal/support/services/Support.chat.service"
import {
    SupportConnection,
    SupportConversation,
    SupportMessage,
    SupportSession,
    SupportSettings
} from "@cloud-internal/support/services/Support.chat.types"

export type SupportChatView = "home" | "conversations" | "conversation"

export interface SupportChatState {
    session?: SupportSession
    settings?: SupportSettings
    connection: SupportConnection
    visible: boolean
    expanded: boolean
    view: SupportChatView
    conversations: SupportConversation[]
    messages: SupportMessage[]
    currentUuid?: string
    typingUuid?: string
    selfTyping: boolean
    sending: boolean
    setSession: (session?: SupportSession, settings?: SupportSettings) => void
    setConnection: (connection: SupportConnection) => void
    setView: (view: SupportChatView) => void
    open: () => void
    close: () => void
    toggleExpanded: () => void
    openConversation: (uuid: string) => Promise<void>
    leaveConversation: () => void
    startConversation: (message: string) => Promise<void>
    sendMessage: (message: string, files: File[]) => Promise<void>
    markSeen: () => void
    reportTyping: (typing: boolean) => void
    resync: () => Promise<void>
    applyMessage: (message: SupportMessage) => void
    applyTyping: (conversationUuid: string, typing: boolean) => void
    applyConversationUpdate: (conversation: SupportConversation) => void
}

export const useSupportChat = create<SupportChatState>((setState, getState) => ({
    connection: "connecting",
    visible: false,
    expanded: false,
    view: "home",
    conversations: [],
    messages: [],
    selfTyping: false,
    sending: false,
    setSession: (session, settings) => setState({session, settings}),
    setConnection: (connection) => setState({connection}),
    setView: (view) => setState({view}),
    open: () => {
        setState((state) => ({visible: true, view: state.view === "conversation" ? state.view : "home"}))
        getState().resync()
    },
    close: () => setState({visible: false, expanded: false}),
    toggleExpanded: () => setState((state) => ({expanded: !state.expanded})),
    resync: async () => {
        const {session, currentUuid} = getState()
        if (!session) return

        setState({conversations: await supportChatService.getConversations(session.sessionToken) ?? []})
        if (!currentUuid) return

        const detail = await supportChatService.getConversation(session.sessionToken, currentUuid)
        if (!detail) return

        setState((state) => ({
            messages: [
                ...detail.messages.slice().reverse(),
                ...state.messages.filter(entry => entry.status === "sending" || entry.status === "failed")
            ],
            conversations: state.conversations.map(conversation => conversation.uuid === currentUuid
                ? {...conversation, ...detail.conversation, unread_message_count: 0}
                : conversation)
        }))
    },
    openConversation: async (uuid) => {
        const {session} = getState()
        if (!session) return

        setState({currentUuid: uuid, messages: []})

        const detail = await supportChatService.getConversation(session.sessionToken, uuid)
        if (!detail) return

        setState((state) => ({
            messages: detail.messages.slice().reverse(),
            conversations: state.conversations.map(conversation => conversation.uuid === uuid
                ? {...conversation, ...detail.conversation, unread_message_count: 0}
                : conversation)
        }))

        await supportChatService.markConversationSeen(session.sessionToken, uuid)
    },
    leaveConversation: () => setState({currentUuid: undefined, messages: []}),
    startConversation: async (message) => {
        const {session} = getState()
        if (!session) return

        setState({sending: true})

        try {
            const detail = await supportChatService.startConversation(session.sessionToken, message)

            setState((state) => ({
                currentUuid: detail.conversation.uuid,
                messages: detail.messages.slice().reverse(),
                conversations: [
                    detail.conversation,
                    ...state.conversations.filter(conversation => conversation.uuid !== detail.conversation.uuid)
                ]
            }))
        } finally {
            setState({sending: false})
        }
    },
    sendMessage: async (message, files) => {
        const {session, currentUuid} = getState()
        if (!session || !currentUuid) return

        const pending: SupportMessage = {
            uuid: `pending-${Date.now()}`,
            status: "sending",
            conversation_uuid: currentUuid,
            created_at: new Date().toISOString(),
            content: message,
            content_type: "text",
            author: {id: session.user.user_id, first_name: session.user.first_name, last_name: "", type: "contact"},
            attachments: files.map(file => ({name: file.name, content_type: file.type, size: file.size}))
        }

        setState((state) => ({sending: true, messages: [...state.messages, pending]}))

        try {
            if (files.length) await supportChatService.uploadAttachments(session.sessionToken, currentUuid, files)

            const stored = message.trim()
                ? await supportChatService.sendMessage(session.sessionToken, currentUuid, message)
                : undefined

            setState((state) => ({
                messages: [
                    ...state.messages.filter(entry => entry.uuid !== pending.uuid && entry.uuid !== stored?.uuid),
                    ...(stored ? [stored] : [])
                ]
            }))

            if (files.length) await getState().resync()
        } catch (error) {
            setState((state) => ({
                messages: state.messages.map(entry => entry.uuid === pending.uuid
                    ? {...entry, status: "failed"}
                    : entry)
            }))
            throw error
        } finally {
            setState({sending: false})
        }
    },
    markSeen: () => {
        const {session, currentUuid} = getState()
        if (!session || !currentUuid) return

        supportChatService.markConversationSeen(session.sessionToken, currentUuid)
        setState((state) => ({
            conversations: state.conversations.map(conversation => conversation.uuid === currentUuid
                ? {...conversation, unread_message_count: 0}
                : conversation)
        }))
    },
    applyMessage: (message) => {
        const {currentUuid, visible} = getState()
        const seen = visible && message.conversation_uuid === currentUuid

        setState((state) => ({
            messages: message.conversation_uuid !== currentUuid || state.messages.some(entry => entry.uuid === message.uuid)
                ? state.messages
                : [...state.messages, message],
            conversations: state.conversations.map(conversation => conversation.uuid === message.conversation_uuid
                ? {
                    ...conversation,
                    last_message: {
                        content: message.text_content || message.content,
                        created_at: message.created_at,
                        author: message.author,
                        attachments: message.attachments
                    },
                    unread_message_count: seen ? 0 : (conversation.unread_message_count || 0) + 1
                }
                : conversation)
        }))

        if (seen) getState().markSeen()
    },
    reportTyping: (typing) => setState({selfTyping: typing}),
    applyTyping: (conversationUuid, typing) => setState({typingUuid: typing ? conversationUuid : undefined}),
    applyConversationUpdate: (conversation) => setState((state) => ({
        conversations: state.conversations.map(entry => entry.uuid === conversation.uuid
            ? {...entry, ...conversation}
            : entry)
    }))
}))
