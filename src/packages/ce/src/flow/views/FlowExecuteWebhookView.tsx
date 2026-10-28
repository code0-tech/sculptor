import React from "react";
import {Button, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {IconCheck, IconCopy} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {ModuleService} from "@edition/module/services/Module.service";
import {useCopyToClipboard} from "@uidotdev/usehooks";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";
import {FlowExecuteDefaultView} from "@edition/flow/views/FlowExecuteDefaultView";

export const FlowExecuteWebhookView: React.FC = () => {

    const params = useParams()

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)

    const [copiedText, copyToClipboard] = useCopyToClipboard();

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowId, flowStore, namespaceId, projectId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectId, namespaceId, projectStore]
    )

    const flowType = React.useMemo(
        () => flowTypeService.getById(flow?.type?.id, {
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flow?.type?.id, namespaceId, projectId, project?.primaryRuntime?.id, flowTypeStore]
    )

    const module = React.useMemo(
        () => moduleService.getById(flowType?.runtimeFlowType?.runtimeModule?.id, {
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flowType?.runtimeFlowType?.runtimeModule?.id, namespaceId, projectId, project?.primaryRuntime?.id, moduleStore]
    )

    const method = React.useMemo(
        () => flow?.settings?.nodes?.find(setting => setting?.flowSettingIdentifier === "http_method")?.value,
        [flow?.settings?.nodes]
    )

    const contentType = React.useMemo(
        () => flow?.settings?.nodes?.find(setting => setting?.flowSettingIdentifier === "http_schema")?.value,
        [flow?.settings?.nodes]
    )

    const endpoint = React.useMemo(() => {
        const definition = module?.definitions?.nodes?.[0]
        if (!definition) return undefined
        const template = `${definition.protocol ?? "http"}://${definition.host}:${definition.port}${definition.endpoint}`
            .replace("${{project_slug}}", project?.slug ?? "${{project_slug}}")
        return (flow?.settings?.nodes ?? []).reduce((current, setting) =>
            current.replace(`\${{${setting?.flowSettingIdentifier}}}`, setting?.value), template)
    }, [module?.definitions?.nodes, project?.slug, flow?.settings?.nodes])

    const curl = React.useMemo(
        () => contentType
            ? `curl -X ${method} "${endpoint}" \\\n  -H "Content-Type: ${contentType}"`
            : `curl -X ${method} "${endpoint}"`,
        [method, contentType, endpoint]
    )

    const copy = React.useCallback((event: React.MouseEvent<HTMLElement>, value: string) => {
        if (!navigator?.clipboard?.writeText) {
            // Without a secure context there is no Clipboard API and the hook falls back to a
            // textarea on document.body, which the modal dialog's focus trap keeps unfocusable,
            // so Firefox copies nothing. Run the same fallback inside the dialog instead; the
            // copyToClipboard call below still records the copied state.
            const dialog = event.currentTarget.closest("[role='dialog']")
            if (dialog) {
                const textArea = document.createElement("textarea")
                textArea.value = value
                textArea.style.position = "fixed"
                textArea.style.opacity = "0"
                dialog.appendChild(textArea)
                textArea.select()
                document.execCommand("copy")
                dialog.removeChild(textArea)
            }
        }
        copyToClipboard(value)
    }, [copyToClipboard])

    return <>
        {endpoint && (
            <>
                <InputWrapper title={"Endpoint"}
                              description={"The url endpoint to execute this workflow."}
                              left={method ? <Text size={"xs"}>{method}</Text> : undefined}
                              right={
                                  <ButtonGroup color={"primary"}>
                                      <Button onClick={event => copy(event, endpoint)}
                                              paddingSize={"xxs"} variant={"none"} color={"secondary"}>
                                          {copiedText === endpoint ? <IconCheck size={13}/> : <IconCopy size={13}/>}
                                      </Button>
                                  </ButtonGroup>
                              }>
                    <div style={{alignSelf: "center", flex: "1 1 auto"}}>
                        <Text>
                            {endpoint}
                        </Text>
                    </div>
                </InputWrapper>
                <Spacing spacing={"xl"}/>
                <InputWrapper title={"Curl"}
                              description={"The curl command to execute this workflow from your terminal."}
                              right={
                                  <ButtonGroup color={"primary"}>
                                      <Button onClick={event => copy(event, curl)}
                                              paddingSize={"xxs"} variant={"none"} color={"secondary"}>
                                          {copiedText === curl ? <IconCheck size={13}/> : <IconCopy size={13}/>}
                                      </Button>
                                  </ButtonGroup>
                              }>
                    <div style={{alignSelf: "center", flex: "1 1 auto"}}>
                        <Text style={{whiteSpace: "pre-wrap", wordBreak: "break-all"}}>
                            {curl}
                        </Text>
                    </div>
                </InputWrapper>
                <Spacing spacing={"xl"}/>
                <hr style={{width: "100%"}} color={"#201e2c"}/>
                <Spacing spacing={"xl"}/>
            </>
        )}
        <FlowExecuteDefaultView/>
    </>

}
