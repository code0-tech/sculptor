import React from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    Spacing,
    Text,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {IconCheck, IconCopy} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {ModuleService} from "@edition/module/services/Module.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {useCopyToClipboard} from "@uidotdev/usehooks";
import {Flow, LiteralValue, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {useSchemaAction} from "@edition/flow/components/FlowWorkerProvider";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook";
import {useFlowViewStore} from "@edition/flow/hooks/Flow.view.hook";
import {Schema} from "@code0-tech/triangulum/dist/util/schema.util";

export interface FlowExecuteDialogComponentProps {
    flowId: Flow['id']
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

interface ManualExecutionForm {
    input?: LiteralValue
}

export const FlowExecuteDialogComponent: React.FC<FlowExecuteDialogComponentProps> = (props) => {

    const {flowId, namespaceId, projectId, open, onOpenChange} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const {execute} = useSchemaAction()
    const addExecution = useFlowExecutionStore(s => s.addExecution)
    const openTab = useFlowViewStore(s => s.setTab)

    const [copiedText, copyToClipboard] = useCopyToClipboard();
    const hasCopiedText = Boolean(copiedText);

    const [triggerSchema, setTriggerSchema] = React.useState<Schema | undefined>(undefined)
    const [executing, setExecuting] = React.useState(false)
    // Bumping the seed produces a fresh initialValues reference which resets the form
    // (there is no explicit reset API on useForm).
    const [formSeed, setFormSeed] = React.useState(0)

    const initialValues = React.useMemo<ManualExecutionForm>(() => ({input: undefined}), [formSeed])

    const [inputs, validate, values] = useForm<ManualExecutionForm>({
        initialValues,
    })

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
        () => moduleService.getById(flowType?.runtimeFlowType?.runtimeModule?.id, {
            namespaceId: namespaceId,
            projectId: projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flowType?.runtimeFlowType?.runtimeModule?.id, namespaceId, projectId, project?.primaryRuntime?.id, moduleStore]
    )

    const dataTypes = React.useMemo(
        () => dataTypeService.values(),
        [dataTypeStore, dataTypeService]
    )

    const functions = React.useMemo(
        () => functionService.values(),
        [functionStore, functionService]
    )

    // The manual execution input is derived from the trigger's return schema (the shape of
    // the data the trigger hands to the flow). Resolve it whenever the dialog opens.
    React.useEffect(() => {
        if (!open || !flow) return
        if (dataTypes.length <= 0 || functions.length <= 0) return

        let cancelled = false
        execute({flow, dataTypes, functions}).then(signatureSchema => {
            if (cancelled) return
            setTriggerSchema(signatureSchema?.return)
        })

        return () => {
            cancelled = true
        }
    }, [open, flow, dataTypes.length, functions.length, flow?.editedAt])

    let endpoint = `http://${module?.definitions?.nodes?.[0]?.host}:${module?.definitions?.nodes?.[0]?.port}${module?.definitions?.nodes?.[0]?.endpoint}`
        .replace("${{project_slug}}", project?.slug ?? "${{project_slug}}")

    flow?.settings?.nodes?.forEach(setting => {
        endpoint = endpoint.replace(`\${{${setting?.flowSettingIdentifier}}}`, setting?.value)
    })

    const copyEndpoint = (event: React.MouseEvent<HTMLElement>) => {
        if (!navigator?.clipboard?.writeText) {
            // Without a secure context there is no Clipboard API and the hook falls back to a
            // textarea on document.body, which the modal dialog's focus trap keeps unfocusable,
            // so Firefox copies nothing. Run the same fallback inside the dialog instead; the
            // copyToClipboard call below still records the copied state.
            const dialog = event.currentTarget.closest("[role='dialog']")
            if (dialog) {
                const textArea = document.createElement("textarea")
                textArea.value = endpoint
                textArea.style.position = "fixed"
                textArea.style.opacity = "0"
                dialog.appendChild(textArea)
                textArea.select()
                document.execCommand("copy")
                dialog.removeChild(textArea)
            }
        }
        copyToClipboard(endpoint)
    }

    const onExecute = React.useCallback(() => {
        const runtimeId = project?.primaryRuntime?.id
        if (!runtimeId || executing) return

        setExecuting(true)
        flowService.triggerExecution({
            flowId: flowId!,
            runtimeId,
            input: (values.input?.value ?? {}) as any,
        }).then(payload => {
            setExecuting(false)
            if ((payload?.errors?.length ?? 0) > 0 || !payload?.executionIdentifier) return

            addExecution({
                executionIdentifier: payload.executionIdentifier,
                flowId,
                namespaceId,
                projectId,
            })

            setFormSeed(seed => seed + 1)
            onOpenChange?.(false)
            openTab("execution")
        }).catch(() => setExecuting(false))
    }, [project?.primaryRuntime?.id, executing, flowService, flowId, values.input, addExecution, namespaceId, projectId, openTab, onOpenChange])

    return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent showCloseButton title={"Manually execute / test your workflow"}>
                <Spacing spacing={"xl"}/>
                {module?.definitions?.nodes?.[0] && (
                    <>
                        <InputWrapper title={"Endpoint"}
                                      description={"The url endpoint to execute this workflow."}
                                      left={flow?.settings?.nodes?.find(setting => setting?.flowSettingIdentifier === "httpMethod")?.value ? (
                                          <Text size={"xs"}>
                                              {flow?.settings?.nodes?.find(setting => setting?.flowSettingIdentifier === "httpMethod")?.value}
                                          </Text>
                                      ) : undefined}
                                      right={
                                          <ButtonGroup color={"primary"}>
                                              <Button onClick={copyEndpoint}
                                                      paddingSize={"xxs"} variant={"none"} color={"secondary"}>
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
                        <Spacing spacing={"xl"}/>
                    </>
                )}
                <hr style={{width: "100%"}} color={"#201e2c"}/>
                <Spacing spacing={"xl"}/>
                {triggerSchema && triggerSchema.input !== "generic" && (
                    <>
                        <DataTypeInputComponent
                            data-qa-selector={"flow-builder-manual-execution-input"}
                            title={"Input for manual execution"}
                            description={"The input passed to the trigger for this manual execution."}
                            schema={triggerSchema}
                            clearable
                            key={"flow-builder-manual-execution-input"}
                            {...inputs.getInputProps("input")}
                            onChange={() => validate("input")}
                        />
                        <Spacing spacing={"xl"}/>
                    </>
                )}
                <Flex justify={"flex-end"}>
                    <Button onClick={onExecute}
                            w={"100%"}
                            disabled={executing || !project?.primaryRuntime?.id}
                            color={"tertiary"}
                            data-qa-selector={"flow-builder-manual-execution-trigger"}>
                        <Text>
                            Manually execute workflow
                        </Text>
                    </Button>
                </Flex>
            </DialogContent>
        </DialogPortal>
    </Dialog>

}
