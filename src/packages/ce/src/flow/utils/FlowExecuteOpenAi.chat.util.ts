import {Flow} from "@code0-tech/sagittarius-graphql-types";

export type ChatJson = string | number | boolean | null | ChatJson[] | {[key: string]: ChatJson}

export interface ChatModel {
    flowId: Flow['id']
    name: string
}

export type ChatRole = "system" | "user" | "assistant" | "tool"

export interface ChatContentPart {
    type: string

    [key: string]: ChatJson | undefined
}

export interface ChatToolCall {
    id: string
    type: "function"
    function: {
        name: string
        arguments: string
    }
}

export interface ChatMessage {
    role: ChatRole
    content?: string | ChatContentPart[] | null
    name?: string
    tool_calls?: ChatToolCall[]
    tool_call_id?: string
}

export interface ChatUsage {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
}

export interface ChatStep {
    name: string
    args?: Record<string, ChatJson>
    result?: string
    error?: string
}

export interface ChatApproval {
    name: string
    args?: Record<string, ChatJson>
    code?: string
}

export interface ChatResponse {
    response?: string
    reasoning?: string
    model?: string
    created?: number
    object?: string
    usage?: ChatUsage
    structured_response?: Record<string, ChatJson>
    steps?: ChatStep[]
    awaiting_approval?: ChatApproval[]
    choices?: {
        finish_reason?: string
        message?: ChatMessage
    }[]
}

export interface ChatEntry {
    id: string
    message: ChatMessage
    reasoning?: string
    finishReason?: string
    model?: string
    created?: number
    object?: string
    usage?: ChatUsage
    structured?: Record<string, ChatJson>
    steps?: ChatStep[]
    approvals?: ChatApproval[]
    raw?: ChatResponse | string
    error?: string
}
