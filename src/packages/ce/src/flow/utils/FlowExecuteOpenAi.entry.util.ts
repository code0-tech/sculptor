import {ExecutionResult, FunctionDefinition} from "@code0-tech/sagittarius-graphql-types";
import {ChatEntry, ChatResponse} from "@edition/flow/utils/FlowExecuteOpenAi.chat.util";

const RESPOND_FUNCTION_IDENTIFIER = "ai::openai::respond"

const respondValue = (result: ExecutionResult, functions: FunctionDefinition[]): ChatResponse | string | null => {
    const respondResult = result.nodeResults?.nodes?.find(nodeResult => functions.find(candidate =>
        candidate.id === (nodeResult?.functionDefinition?.id ?? nodeResult?.nodeFunction?.functionDefinition?.id)
    )?.identifier === RESPOND_FUNCTION_IDENTIFIER)

    return respondResult?.parameterResults?.[0]?.value ?? result.success ?? null
}

const respondContent = (response: ChatResponse | string | null): string => {
    if (typeof response === "string") return response
    if (!response) return ""
    if (typeof response.response === "string") return response.response

    const content = response.choices?.[0]?.message?.content

    if (typeof content === "string") return content

    return JSON.stringify(response, null, 2)
}

export const chatEntry = (result: ExecutionResult, functions: FunctionDefinition[]): ChatEntry => {
    const response = respondValue(result, functions)
    const structured = typeof response === "string" ? undefined : response
    const choice = structured?.choices?.[0]
    const failed = result.nodeResults?.nodes?.find(nodeResult => !!nodeResult?.error)

    return {
        id: `${result.id}`,
        message: {
            role: "assistant",
            content: respondContent(response),
            tool_calls: choice?.message?.tool_calls
        },
        reasoning: structured?.reasoning,
        finishReason: choice?.finish_reason,
        model: structured?.model,
        created: structured?.created,
        object: structured?.object,
        usage: structured?.usage,
        structured: structured?.structured_response,
        steps: structured?.steps,
        approvals: structured?.awaiting_approval,
        raw: response ?? undefined,
        error: result.error?.message ?? failed?.error?.message ?? undefined
    }
}
