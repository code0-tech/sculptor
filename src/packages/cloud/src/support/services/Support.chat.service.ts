export type SupportAuthorType = "contact" | "agent" | "ai_assistant" | "system"

export type SupportConversationStatus = "Open" | "Snoozed" | "Resolved" | "Closed"

export interface SupportAuthor {
    id: number
    first_name: string
    last_name: string
    email?: string | null
    avatar_url?: string | null
    availability_status?: string | null
    type: SupportAuthorType
    last_active_at?: string | null
    active_at?: string | null
}

export interface SupportAttachment {
    uuid?: string
    name?: string
    filename?: string
    content_type?: string
    size?: number
    url?: string
}

export interface SupportMessage {
    id?: number
    uuid: string
    status: string
    conversation_uuid: string
    created_at: string
    content: string
    text_content?: string
    content_type: string
    author: SupportAuthor
    attachments: SupportAttachment[]
}

export interface SupportConversation {
    uuid: string
    status: SupportConversationStatus
    created_at: string
    contact_last_seen_at?: string | null
    unread_message_count: number
    assignee?: SupportAuthor | null
    last_message?: {
        content: string
        created_at: string
        author: SupportAuthor
        attachments: SupportAttachment[]
    } | null
}

export interface SupportConversationDetail {
    conversation: SupportConversation
    messages: SupportMessage[]
    working_hours_utc_offset?: number
}

export interface SupportBusinessHours {
    name: string
    is_always_open: boolean
    hours: Record<string, { open: string, close: string }>
}

export interface SupportSettings {
    brand_name: string
    website_url: string
    greeting_message: string
    introduction_message: string
    chat_introduction: string
    chat_reply_expectation_message: string
    show_office_hours_in_chat: boolean
    working_hours_utc_offset: number
    business_hours: SupportBusinessHours[]
    notice_banner: { text: string, enabled: boolean }
    features: { emoji: boolean, file_upload: boolean, transcript: boolean }
    users: {
        allow_start_conversation: boolean
        prevent_multiple_conversations: boolean
        prevent_reply_to_closed_conversation: boolean
        start_conversation_button_text: string
        quick_replies: string[]
        direct_to_conversation: boolean
    }
}

export interface SupportSession {
    sessionToken: string
    inboxId: string
    socketUrl: string
    user: { user_id: number, first_name: string, last_name: string, is_visitor: boolean }
}

interface SupportResponse<T> {
    status: string
    data: T
}

export class SupportChatService {

    private readonly base: string

    constructor(base: string = "/api/support") {
        this.base = base
    }

    private headers(token: string, contentType?: string): HeadersInit {
        return contentType ? {"Content-Type": contentType, "x-support-session": token} : {"x-support-session": token}
    }

    private async read<T>(token: string, path: string, search?: Record<string, string>): Promise<T | undefined> {
        const query = search ? `?${new URLSearchParams(search).toString()}` : ""

        return fetch(`${this.base}/${path}${query}`, {headers: this.headers(token)})
            .then(response => response.ok ? response.json() as Promise<SupportResponse<T>> : undefined)
            .then(result => result?.data ?? undefined)
            .catch(() => undefined)
    }

    private async write<T>(token: string, path: string, body?: unknown): Promise<T> {
        const response = await fetch(`${this.base}/${path}`, {
            method: "POST",
            headers: this.headers(token, "application/json"),
            body: body === undefined ? undefined : JSON.stringify(body)
        })

        if (!response.ok) throw new Error(`Support chat request failed: ${response.status}`)

        return await response.json().then((result: SupportResponse<T>) => result.data)
    }

    async openSession(appSessionToken: string): Promise<SupportSession | undefined> {
        return fetch(`${this.base}/session`, {
            method: "POST",
            headers: {"Content-Type": "application/json", authorization: `Session ${appSessionToken}`}
        })
            .then(response => response.ok ? response.json() as Promise<SupportSession> : undefined)
            .catch(() => undefined)
    }

    getSettings(token: string): Promise<SupportSettings | undefined> {
        return this.read<SupportSettings>(token, "chat/settings")
    }

    getConversations(token: string): Promise<SupportConversation[] | undefined> {
        return this.read<SupportConversation[]>(token, "chat/conversations")
    }

    getConversation(token: string, uuid: string): Promise<SupportConversationDetail | undefined> {
        return this.read<SupportConversationDetail>(token, `chat/conversations/${uuid}`)
    }

    startConversation(token: string, message: string): Promise<SupportConversationDetail> {
        return this.write<SupportConversationDetail>(token, "chat/conversations/init", {message})
    }

    sendMessage(token: string, uuid: string, message: string): Promise<SupportMessage> {
        return this.write<SupportMessage>(token, `chat/conversations/${uuid}/message`, {message})
    }

    markConversationSeen(token: string, uuid: string): Promise<unknown> {
        return this.write<unknown>(token, `chat/conversations/${uuid}/update-last-seen`).catch(() => undefined)
    }

    async uploadAttachments(token: string, uuid: string, files: File[]): Promise<unknown> {
        const body = new FormData()

        body.append("conversation_uuid", uuid)
        files.forEach(file => body.append("files", file))

        const response = await fetch(`${this.base}/media/upload`, {
            method: "POST",
            headers: this.headers(token),
            body
        })

        if (!response.ok) throw new Error(`Support chat upload failed: ${response.status}`)

        return await response.json()
    }

    async downloadTranscript(token: string, uuid: string): Promise<Blob> {
        const response = await fetch(`${this.base}/chat/conversations/${uuid}/transcript`, {
            headers: this.headers(token)
        })

        if (!response.ok) throw new Error(`Support chat transcript failed: ${response.status}`)

        return await response.blob()
    }

}

export const supportChatService = new SupportChatService()
