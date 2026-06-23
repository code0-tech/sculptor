import React from "react";
import {Alert, Spacing, Text, useForm, useService, useStore} from "@code0-tech/pictor";
import {Flow, LiteralValue, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {
    FALLBACK_FLOW_TYPE_DESCRIPTION,
    FALLBACK_FLOW_TYPE_NAME,
    FALLBACK_FLOW_TYPE_SETTING_DESCRIPTION,
    FALLBACK_FLOW_TYPE_SETTING_NAME
} from "@core/util/fallback-translations";
import {useNodesData} from "@xyflow/react";
import {NodeSchema} from "@code0-tech/triangulum";

export interface FunctionFileTriggerComponentProps {
    flowId: Flow['id']
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
}

export const FunctionFileTriggerComponent: React.FC<FunctionFileTriggerComponentProps> = React.memo((props) => {

    const {flowId, namespaceId, projectId} = props

    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const flowService = useService(FlowService)
    const validation = useFlowValidation(flowId)
    const changedValue = React.useRef(false)
    const changedSettings = React.useRef<Set<string>>(new Set())

    const instance = React.useMemo(
        () => flowService.getById(flowId, {namespaceId, projectId}),
        [flowService, flowId, namespaceId, projectId]
    )

    const definition = React.useMemo(
        () => flowTypeService.getById(instance?.type?.id!!),
        [flowTypeStore, instance?.type?.id]
    )

    const initialValues: Record<string | "inputType", any> = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.flowTypeSettings?.forEach((setting, index) => {
            const flowSetting = instance?.settings?.nodes?.[index]
            values[setting.id!] = {
                __typename: "LiteralValue",
                value: flowSetting?.value,
            }
        })
        return values
    }, [definition])

    const flowNode = useNodesData(flowId!)

    const triggerValidation = React.useMemo(
        () => validation?.find(v => v.nodeId === null && v.parameterIndex === null),
        [validation?.length]
    )

    const settingsValidations = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.flowTypeSettings?.forEach((setting, index) => {
            values[setting!.id!] = (_: any) => {
                const validationForSetting = validation?.find(v => v.parameterIndex === index && !v.nodeId)
                if (validationForSetting) {
                    return validationForSetting.message?.[0]?.content || "Invalid value"
                }
                return null
            }
        })
        return values
    }, [validation?.length, definition])

    const onSubmit = React.useCallback((values: Record<string, LiteralValue | undefined>) => {
        React.startTransition(async () => {
            for (const flowTypeSetting of definition?.flowTypeSettings ?? []) {

                if (!changedSettings.current.has(flowTypeSetting.id!)) continue

                const index = definition?.flowTypeSettings?.findIndex(p => p?.id === flowTypeSetting?.id)
                if (typeof index !== "number") return

                const value = values[flowTypeSetting.id!]
                await flowService.setSettingValue(flowId, index, value?.value, flowTypeSetting.identifier)

                changedSettings.current.delete(flowTypeSetting.id!)
            }
            changedValue.current = false
        })
    }, [flowService, definition])

    const [inputs, validate] = useForm<Record<string, LiteralValue | undefined>>({
        initialValues: initialValues,
        validate: settingsValidations,
        truthyValidationBeforeSubmit: false,
        useInitialValidation: true,
        onSubmit: onSubmit
    })

    React.useEffect(
        () => validate(undefined, false),
        [validation]
    )

    React.useEffect(
        () => console.log("test")
    )

    return <>
        <Text size={"md"}>{definition?.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_NAME}</Text>
        <Spacing spacing={"xs"}/>
        <Text hierarchy={"tertiary"}>{definition?.descriptions?.[0]?.content ?? FALLBACK_FLOW_TYPE_DESCRIPTION}</Text>
        {
            triggerValidation && <>
                <Spacing spacing={"xl"}/>
                <Alert color={"error"}>
                    {triggerValidation?.message?.[0]?.content as string}
                </Alert>
            </>
        }
        <Spacing spacing={"xl"}/>
        <Text size={"md"}>Settings</Text>
        <Spacing spacing={"xl"}/>
        {definition?.flowTypeSettings?.map((settingDefinition, index) => {

            if (!settingDefinition) return null

            const title = settingDefinition.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_SETTING_NAME
            const description = settingDefinition?.descriptions?.[0]?.content ?? FALLBACK_FLOW_TYPE_SETTING_DESCRIPTION

            return <div>
                {/*@ts-ignore*/}
                <DataTypeInputComponent data-qa-selector={"flow-builder-setting"}
                                        title={title}
                                        schema={(flowNode?.data?.schema as NodeSchema[])?.[index]}
                                        description={description}
                                        clearable
                                        key={settingDefinition.id}
                                        onChange={() => {
                                            changedValue.current = true
                                            changedSettings.current.add(settingDefinition.id!)
                                            validate()
                                        }}
                                        {...inputs.getInputProps(settingDefinition.id!)}
                />
                <Spacing spacing={"xl"}/>
            </div>

        })}
    </>
})
