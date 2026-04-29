import React from "react";
import {Alert, InputSyntaxSegment, Spacing, Text, useForm, useService, useStore} from "@code0-tech/pictor";
import {Flow, LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {DataTypeTypeInputComponent} from "@edition/datatype/components/inputs/datatype/DataTypeTypeInputComponent";
import {
    FALLBACK_FLOW_TYPE_DESCRIPTION,
    FALLBACK_FLOW_TYPE_NAME,
    FALLBACK_FLOW_TYPE_SETTING_DESCRIPTION,
    FALLBACK_FLOW_TYPE_SETTING_NAME
} from "@core/util/fallback-translations";

export interface FunctionFileTriggerComponentProps {
    instance: Flow
}

export const FunctionFileTriggerComponent: React.FC<FunctionFileTriggerComponentProps> = (props) => {

    const {instance} = props

    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const flowService = useService(FlowService)
    const validation = useFlowValidation(instance.id)
    const [, startTransition] = React.useTransition()
    const changedParameters = React.useRef<Set<number>>(new Set())

    const definition = React.useMemo(
        () => flowTypeService.getById(instance.type?.id!!),
        [flowTypeStore, instance]
    )

    const initialValues: Record<string | "inputType", any> = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.flowTypeSettings?.forEach((setting, index) => {
            const flowSetting = instance.settings?.nodes?.[index]
            values[setting.id!] = flowSetting?.value?.__typename === "LiteralValue" ? (flowSetting?.value.value) : (flowSetting?.value)
        })
        return values
    }, [definition, instance])

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
    }, [instance, validation])

    const onSubmit = React.useCallback((values: any) => {
        startTransition(async () => {
            if (values.inputType) {
                await flowService.setInputType(instance.id, values.inputType)
            }
            for (const flowTypeSetting of definition?.flowTypeSettings ?? []) {
                const index = definition?.flowTypeSettings?.findIndex(p => p?.id === flowTypeSetting?.id)
                if (typeof index !== "number") return
                if (!changedParameters.current.has(index)) continue;

                const syntaxSegment = values[flowTypeSetting.id!]
                const syntaxValue = syntaxSegment?.[0]?.value ?? syntaxSegment?.value ?? syntaxSegment ?? null as LiteralValue | null

                if (!syntaxValue || !syntaxSegment || (Array.isArray(syntaxValue) && Array.from(syntaxValue).length <= 0)) {
                    await flowService.setSettingValue(instance.id, index, null, flowTypeSetting.identifier)
                    continue;
                }

                await flowService.setSettingValue(props.instance.id, index, syntaxValue, flowTypeSetting.identifier)
            }
            changedParameters.current.clear()
        })
    }, [definition, changedParameters])

    const [inputs, validate] = useForm<Record<string | "inputType", InputSyntaxSegment[]>>({
        initialValues: initialValues,
        validate: settingsValidations,
        truthyValidationBeforeSubmit: false,
        useInitialValidation: true,
        onSubmit: onSubmit
    })

    React.useEffect(() => {
        validate()
    }, [validation])

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
                                        flowId={instance.id}
                                        nodeId={undefined}
                                        parameterIndex={index}
                                        title={title}
                                        description={description}
                                        clearable
                                        onChange={() => {
                                            //TODO this should be debounced
                                            changedParameters.current.add(index)
                                            validate()
                                        }}
                                        {...inputs.getInputProps(settingDefinition.id!)}
                />
                <Spacing spacing={"xl"}/>
            </div>

        })}
    </>
}
