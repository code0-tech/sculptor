import React from "react";
import {Alert, InputSyntaxSegment, Spacing, Text, useForm, useService, useStore} from "@code0-tech/pictor";
import {Flow, LiteralValue, NodeFunction, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
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
import {useNodes} from "@xyflow/react";
import {NodeSchema} from "@code0-tech/triangulum";

export interface FunctionFileTriggerComponentProps {
    instance: Flow
}

export const FunctionFileTriggerComponent: React.FC<FunctionFileTriggerComponentProps> = (props) => {

    const {instance} = props

    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const flowService = useService(FlowService)
    const validation = useFlowValidation(instance.id)
    const changedValue = React.useRef(false)
    const [, startTransition] = React.useTransition()

    const definition = React.useMemo(
        () => flowTypeService.getById(instance.type?.id!!),
        [flowTypeStore, instance]
    )

    const initialValues: Record<string | "inputType", any> = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.flowTypeSettings?.forEach((setting, index) => {
            const flowSetting = instance.settings?.nodes?.[index]
            values[setting.id!] = {
                __typename: "LiteralValue",
                value: flowSetting?.value,
            }
        })
        return values
    }, [definition])

    const flowNode = useNodes().find(value => value.id == instance.id)

    const triggerValidation = React.useMemo(
        () => validation?.find(v => v.nodeId === null && v.parameterIndex === null),
        [validation]
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
    }, [validation, instance, definition])

    const onSubmit = React.useCallback((values: Record<string, LiteralValue | undefined>) => {
        startTransition(async () => {
            for (const flowTypeSetting of definition?.flowTypeSettings ?? []) {

                const index = definition?.flowTypeSettings?.findIndex(p => p?.id === flowTypeSetting?.id)
                if (typeof index !== "number") return

                const value = values[flowTypeSetting.id!]
                await flowService.setSettingValue(props.instance.id, index, value?.value, flowTypeSetting.identifier)

                changedValue.current = false
            }
        })
    }, [flowService, definition])

    const [inputs, validate, values] = useForm<Record<string, LiteralValue | undefined>>({
        initialValues: initialValues,
        validate: settingsValidations,
        truthyValidationBeforeSubmit: false,
        useInitialValidation: true,
        onSubmit: onSubmit
    })

    React.useEffect(
        () => {
            if (changedValue.current)
                validate()
        },
        [values]
    )

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
                                        onChange={() => changedValue.current = true}
                                        {...inputs.getInputProps(settingDefinition.id!)}
                />
                <Spacing spacing={"xl"}/>
            </div>

        })}
    </>
}
