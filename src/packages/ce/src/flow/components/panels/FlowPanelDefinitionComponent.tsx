import React from "react";
import {Panel} from "@xyflow/react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {
    Button,
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogTrigger,
    Spacing,
    Text, useService, useStore
} from "@code0-tech/pictor";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {IconCheck, IconCopy} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {ModuleService} from "@edition/module/services/Module.service";
import {useCopyToClipboard} from "@uidotdev/usehooks";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";

export const FlowPanelDefinitionComponent: React.FC = () => {

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
    const hasCopiedText = Boolean(copiedText);

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const flow = React.useMemo(
        () => flowService.getById(flowId, {
            namespaceId,
            projectId
        }),
        [flowId, flowStore, namespaceId, projectId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId, {
            namespaceId
        }),
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
        () => moduleService.getById(flowType?.runtimeModule?.id, {
            namespaceId: namespaceId,
            projectId: projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flowType?.runtimeModule?.id, namespaceId, projectId, project?.primaryRuntime?.id, moduleStore]
    )

    let endpoint = `http://${module?.definitions?.nodes?.[0]?.host}:${module?.definitions?.nodes?.[0]?.port}${module?.definitions?.nodes?.[0]?.endpoint}`
        .replace("${{project_slug}}", project?.slug ?? "${{project_slug}}")

    flow?.settings?.nodes?.forEach(setting => {
        endpoint = endpoint.replace(`\${{${setting?.flowSettingIdentifier}}}`, setting?.value)
    })

    return module?.definitions?.nodes?.[0] &&
        <Panel position={"bottom-right"} data-qa-selector={"flow-builder-definition-panel"}>
            <ButtonGroup style={{textWrap: "nowrap"}}>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button data-qa-selector={"flow-builder-control-panel-execute"}
                                paddingSize={"xxs"}
                                variant={"none"}
                                color={"tertiary"}>
                            <Text>
                                Execute flow
                            </Text>
                        </Button>
                    </DialogTrigger>
                    <DialogPortal>
                        <DialogOverlay/>
                        <DialogContent showCloseButton title={"Execute the flow to see the results"}>
                            <Spacing spacing={"xl"}/>
                            <InputWrapper title={"Endpoint"}
                                          description={"The url endpoint to execute this flow."}
                                          left={flow?.settings?.nodes?.find(setting => setting?.flowSettingIdentifier === "httpMethod")?.value ? (
                                              <Text size={"xs"}>
                                                  {flow?.settings?.nodes?.find(setting => setting?.flowSettingIdentifier === "httpMethod")?.value}
                                              </Text>
                                          ) : undefined}
                                          right={
                                              <ButtonGroup color={"primary"}>
                                                  <Button onClick={() => {
                                                      copyToClipboard(endpoint)
                                                  }} paddingSize={"xxs"} variant={"none"} color={"secondary"}>
                                                      {hasCopiedText ? <IconCheck size={13}/> :
                                                          <IconCopy size={13}/>}
                                                  </Button>
                                              </ButtonGroup>
                                          }>
                                <div style={{
                                    alignSelf: "center",
                                    flex: "1 1 auto"
                                }}>
                                    <Text>
                                        {endpoint}
                                    </Text>
                                </div>

                            </InputWrapper>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>
            </ButtonGroup>
        </Panel>

}