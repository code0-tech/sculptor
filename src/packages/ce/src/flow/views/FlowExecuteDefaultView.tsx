import React from "react";
import {Button, DialogClose, Spacing, Text, useForm, useService, useStore} from "@code0-tech/pictor";
import {Flow, LiteralValue, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";
import {FlowService} from "@edition/flow/services/Flow.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {useSchemaAction} from "@edition/flow/components/FlowWorkerProvider";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {useFlowExecutionStore} from "@edition/flow/hooks/Flow.execution.hook";
import {useFlowViewStore} from "@edition/flow/hooks/Flow.view.hook";
import {Schema} from "@code0-tech/triangulum";
import {useDefaultValue} from "@edition/datatype/hooks/DataType.defaultValue.hook";
import {isVoidType} from "@edition/datatype/utils/DataType.isVoidType.util";

export const FlowExecuteDefaultView: React.FC = () => {

    const params = useParams()

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const {execute} = useSchemaAction()
    const addExecution = useFlowExecutionStore(s => s.addExecution)
    const openTab = useFlowViewStore(s => s.setTab)

    const [triggerSchema, setTriggerSchema] = React.useState<Schema | undefined>(undefined)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const defaultInput = useDefaultValue(triggerSchema?.type)

    const initialValues = React.useMemo(
        () => ({input: defaultInput ?? undefined}),
        [defaultInput]
    )

    const [inputs, validate, values] = useForm({
        initialValues,
    })

    const flow = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowId, flowStore, namespaceId, projectId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectId, namespaceId, projectStore]
    )

    const dataTypes = React.useMemo(
        () => dataTypeService.values(),
        [dataTypeStore, dataTypeService]
    )

    const functions = React.useMemo(
        () => functionService.values(),
        [functionStore, functionService]
    )

    React.useEffect(() => {
        if (!flow) return
        if (dataTypes.length <= 0 || functions.length <= 0) return

        let cancelled = false
        execute({flow, dataTypes, functions}).then(signatureSchema => {
            if (cancelled) return
            setTriggerSchema(signatureSchema?.return)
        })

        return () => {
            cancelled = true
        }
    }, [flow, dataTypes.length, functions.length, flow?.editedAt])

    const onExecute = React.useCallback(async () => {
        const runtimeId = project?.primaryRuntime?.id
        if (!runtimeId) return

        const edited = !!flow?.editedAt && new Date(flow.updatedAt ?? Date.now()).getTime() != new Date(flow.editedAt).getTime()
        if (edited) {
            const flowInput = flowService.getPayloadById(flowId)
            if (flowInput) await flowService.flowUpdate({flowInput, flowId: flowId!})
        }

        const payload = await flowService.triggerExecution({
            flowId: flowId!,
            runtimeId,
            input: (values.input?.value ?? defaultInput?.value ?? null) as any,
        })

        if ((payload?.errors?.length ?? 0) > 0 || !payload?.executionIdentifier) return

        addExecution({
            executionIdentifier: payload.executionIdentifier,
            flowId,
            namespaceId,
            projectId,
        })

        openTab("execution")
    }, [project?.primaryRuntime?.id, flow?.editedAt, flow?.updatedAt, flowService, flowId, values.input, defaultInput, addExecution, namespaceId, projectId, openTab])

    return <div data-qa-selector={"flow-builder-manual-execution-form"}>
        {triggerSchema && !isVoidType(triggerSchema.type) && (
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
        <DialogClose asChild>
            <Button onClick={onExecute}
                    w={"100%"}
                    disabled={!project?.primaryRuntime?.id}
                    color={"tertiary"}
                    data-qa-selector={"flow-builder-manual-execution-trigger"}>
                <Text>
                    Manually execute workflow
                </Text>
            </Button>
        </DialogClose>
    </div>

}
