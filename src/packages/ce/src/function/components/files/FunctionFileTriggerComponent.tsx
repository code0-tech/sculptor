import React from "react";
import {Alert, Button, Flex, Spacing, Text, useForm, useService, useStore} from "@code0-tech/pictor";
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
import * as Collapsible from "@radix-ui/react-collapsible";
import {IconChevronDown} from "@tabler/icons-react";

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
                await flowService.setSettingValue(flowId, index, value?.value, definition!)

                changedSettings.current.delete(flowTypeSetting.id!)
            }
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
        {(() => {
            const indexedSettings = definition?.flowTypeSettings
                ?.map((settingDefinition, index) => ({settingDefinition, index}))
                ?.filter(({settingDefinition}) => settingDefinition && !settingDefinition.hidden) ?? []

            const requiredSettings = indexedSettings.filter(({settingDefinition}) => !settingDefinition!.optional)
            const optionalSettings = indexedSettings.filter(({settingDefinition}) => settingDefinition!.optional)

            const renderSetting = (settingDefinition: NonNullable<typeof indexedSettings[number]['settingDefinition']>, index: number) => {
                const title = settingDefinition.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_SETTING_NAME
                const description = settingDefinition?.descriptions?.[0]?.content ?? FALLBACK_FLOW_TYPE_SETTING_DESCRIPTION

                return <div key={settingDefinition.id}>
                    {/*@ts-ignore*/}
                    <DataTypeInputComponent data-qa-selector={"flow-builder-setting"}
                                            title={title}
                                            schema={(flowNode?.data?.schema as NodeSchema[])?.[index]}
                                            description={description}
                                            clearable
                                            onChange={() => {
                                                changedSettings.current.add(settingDefinition.id!)
                                                validate()
                                            }}
                                            {...inputs.getInputProps(settingDefinition.id!)}
                    />
                    <Spacing spacing={"xl"}/>
                </div>
            }

            return <>
                {requiredSettings.map(({settingDefinition, index}) => renderSetting(settingDefinition!, index))}
                {optionalSettings.length > 0 && (
                    <Collapsible.Root>
                        <Collapsible.Trigger asChild>
                            <Flex justify={"space-between"} align={"center"} style={{gap: "0.7rem"}}>
                                <Text size={"md"}>Optional settings</Text>
                                <Button variant={"none"} color={"primary"} paddingSize={"xxs"}>
                                    <IconChevronDown size={16}/>
                                </Button>
                            </Flex>
                        </Collapsible.Trigger>
                        <Spacing spacing={"md"}/>
                        <Collapsible.Content>
                            {optionalSettings.map(({settingDefinition, index}) => renderSetting(settingDefinition!, index))}
                        </Collapsible.Content>
                    </Collapsible.Root>
                )}
            </>
        })()}
    </>
})
