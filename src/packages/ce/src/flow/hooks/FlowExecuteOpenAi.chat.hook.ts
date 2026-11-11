import React from "react";
import {IconString, useService, useStore} from "@code0-tech/pictor";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook";
import {
    ChatContentPart,
    ChatEntry,
    ChatMessage,
    ChatModel,
    ChatToolCall
} from "@edition/flow/utils/FlowExecuteOpenAi.chat.util";
import {chatEntry} from "@edition/flow/utils/FlowExecuteOpenAi.entry.util";
import {chatSetting} from "@edition/flow/utils/FlowExecuteOpenAi.setting.util";

export interface ChatAttachment {
    name: string
    part: ChatContentPart
}

export interface OpenAiChat {
    entries: ChatEntry[]
    prompt: string
    waiting: boolean
    attachments: ChatAttachment[]
    toolCall?: ChatToolCall
    openToolCalls: ChatToolCall[]
    models: ChatModel[]
    targetFlowId: Flow['id']
    icon: IconString
    route?: string
    executable: boolean
    setPrompt: (prompt: string) => void
    setToolCall: (toolCall?: ChatToolCall) => void
    setTargetFlowId: (flowId: Flow['id']) => void
    attach: (files: File[]) => void
    detach: (index: number) => void
    clear: () => void
    send: () => Promise<void>
}

export const useOpenAiChat = (): OpenAiChat => {

    const params = useParams()

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const addExecution = useFlowExecutionStore(state => state.addExecution)

    const [entries, setEntries] = React.useState<ChatEntry[]>([])
    const [prompt, setPrompt] = React.useState<string>("")
    const [toolCall, setToolCall] = React.useState<ChatToolCall | undefined>(undefined)
    const [attachments, setAttachments] = React.useState<ChatAttachment[]>([])
    const [selectedFlowId, setSelectedFlowId] = React.useState<Flow['id'] | undefined>(undefined)
    const [waiting, setWaiting] = React.useState<boolean>(false)
    const [baselineResultId, setBaselineResultId] = React.useState<string | undefined>(undefined)
    const [executionIdentifier, setExecutionIdentifier] = React.useState<string | undefined>(undefined)

    const pending = useFlowExecutionStore(state =>
        !!executionIdentifier && state.executions.some(execution =>
            execution.executionIdentifier === executionIdentifier))

    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${Number(params.namespaceId)}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${Number(params.projectId)}`
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${Number(params.flowId)}`
    const targetFlowId = selectedFlowId ?? flowId

    const flow = React.useMemo(
        () => flowService.getById(targetFlowId, {namespaceId, projectId}),
        [targetFlowId, flowStore, namespaceId, projectId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectId, namespaceId, projectStore]
    )

    const runtimeId = project?.primaryRuntime?.id

    const functions = React.useMemo(
        () => functionService.values({namespaceId, projectId, runtimeId}),
        [namespaceId, projectId, runtimeId, functionStore]
    )

    const flowType = React.useMemo(
        () => flowTypeService.getById(flow?.type?.id, {namespaceId, projectId, runtimeId}),
        [flow?.type?.id, namespaceId, projectId, runtimeId, flowTypeStore]
    )

    const models = React.useMemo(() => flowService.values({namespaceId, projectId})
            .filter(candidate => flowTypeService.getById(candidate.type?.id,
                {namespaceId, projectId, runtimeId})?.identifier === "ai::openai::server")
            .map(candidate => ({flowId: candidate.id, name: chatSetting(candidate, "model")}))
            .filter((candidate): candidate is ChatModel => !!candidate.flowId && !!candidate.name),
        [flowStore, flowTypeStore, namespaceId, projectId, runtimeId])

    const latestResult = React.useMemo(
        () => (flow?.executionResults?.nodes ?? [])[(flow?.executionResults?.nodes?.length ?? 0) - 1],
        [flow?.executionResults?.nodes]
    )

    const openToolCalls = React.useMemo(() => {
        const answered = entries
            .filter(entry => entry.message.role === "tool")
            .map(entry => entry.message.tool_call_id)

        return entries
            .flatMap(entry => entry.message.tool_calls ?? [])
            .filter(candidate => !answered.includes(candidate.id))
    }, [entries])

    const attach = React.useCallback((files: File[]) => {
        files.forEach(file => {
            const reader = new FileReader()

            reader.onload = () => {
                const data = String(reader.result ?? "")

                const part: ChatContentPart = file.type.startsWith("image/")
                    ? {type: "image_url", image_url: {url: data}}
                    : (file.type.startsWith("audio/")
                        ? {type: "input_audio", input_audio: {data: data.split(",")[1] ?? "",
                                format: file.type.replace("audio/", "")}}
                        : {type: "file", file: {filename: file.name, file_data: data}})

                setAttachments(current => [...current, {name: file.name, part}])
            }

            reader.readAsDataURL(file)
        })
    }, [])

    const detach = React.useCallback((index: number) =>
        setAttachments(current => current.filter((_, position) => position !== index)), [])

    const clear = React.useCallback(() => setEntries([]), [])

    const send = React.useCallback(async () => {
        const content = prompt.trim()
        if (!runtimeId || waiting || (!content && attachments.length <= 0)) return

        const edited = !!flow?.editedAt
            && new Date(flow.updatedAt ?? Date.now()).getTime() != new Date(flow.editedAt).getTime()

        if (edited) {
            const flowInput = flowService.getPayloadById(targetFlowId)
            if (flowInput) await flowService.flowUpdate({flowInput, flowId: targetFlowId})
        }

        const parts = attachments.map(attachment => attachment.part)

        const message: ChatMessage = {
            role: toolCall ? "tool" : "user",
            content: parts.length <= 0 ? content : (content ? [{type: "text", text: content}, ...parts] : parts),
            name: toolCall?.function.name,
            tool_call_id: toolCall?.id
        }

        const history = entries
            .filter(entry => !entry.error)
            .map(entry => entry.message)

        setPrompt("")
        setAttachments([])
        setToolCall(undefined)
        setWaiting(true)
        setExecutionIdentifier(undefined)
        setBaselineResultId(latestResult?.id ?? undefined)
        setEntries(current => [...current, {id: `${targetFlowId}-${Date.now()}`, message}])

        const payload = await flowService.triggerExecution({
            flowId: targetFlowId,
            runtimeId,
            input: {
                model: chatSetting(flow, "model"),
                messages: [...history, message]
            }
        })

        if ((payload?.errors?.length ?? 0) > 0 || !payload?.executionIdentifier) {
            setWaiting(false)
            setEntries(current => [...current, {
                id: `${targetFlowId}-${Date.now()}-error`,
                message: {role: "assistant", content: ""},
                error: "This workflow could not be executed."
            }])
            return
        }

        setExecutionIdentifier(payload.executionIdentifier)
        addExecution({
            executionIdentifier: payload.executionIdentifier,
            flowId: targetFlowId,
            namespaceId,
            projectId
        })
    }, [runtimeId, prompt, attachments, waiting, flow, flowService, targetFlowId, entries, toolCall,
        latestResult?.id, addExecution, namespaceId, projectId])

    React.useEffect(() => {
        if (!waiting) return

        const arrived = !!latestResult && latestResult.id !== baselineResultId
        if (!arrived && (!executionIdentifier || pending)) return

        setWaiting(false)

        if (!arrived || !latestResult) {
            setEntries(current => [...current, {
                id: `${targetFlowId}-${Date.now()}-missing`,
                message: {role: "assistant", content: ""},
                error: "This execution did not return a result."
            }])
            return
        }

        setEntries(current => [...current, chatEntry(latestResult, functions)])
    }, [waiting, latestResult, baselineResultId, executionIdentifier, pending, functions, targetFlowId])

    return {
        entries,
        prompt,
        waiting,
        attachments,
        toolCall,
        openToolCalls,
        models,
        targetFlowId,
        icon: (flowType?.displayIcon ?? "tabler:ai") as IconString,
        route: chatSetting(flow, "route"),
        executable: !!runtimeId,
        setPrompt,
        setToolCall,
        setTargetFlowId: setSelectedFlowId,
        attach,
        detach,
        clear,
        send
    }
}
