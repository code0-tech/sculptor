import React from "react";
import {Flex, InputSyntaxSegment, useForm, useService, useStore} from "@code0-tech/pictor";
import {Flow, LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {getTypesFromFunction} from "@code0-tech/triangulum";
import {DataTypeTypeInputComponent} from "@edition/datatype/components/inputs/datatype/DataTypeTypeInputComponent";
import {
    FALLBACK_FLOW_TYPE_DESCRIPTION,
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

    const flowInputType = getTypesFromFunction({signature: instance.signature}).returnType
    const flowTypeInputType = getTypesFromFunction({signature: definition?.signature}).returnType

    const initialValues: Record<number | "inputType", any> = React.useMemo(() => {
        const values: Record<number | "inputType", any> = {
            "inputType": flowInputType || flowTypeInputType
        }
        definition?.flowTypeSettings?.forEach((setting, index) => {
            const flowSetting = instance.settings?.nodes?.[index]
            values[index] = flowSetting?.value?.__typename === "LiteralValue" ? (flowSetting?.value.value) : (flowSetting?.value)
        })
        return values
    }, [definition, instance])

    const validations = React.useMemo(() => {
        const values: Record<string, any> = {}
        instance.settings?.nodes?.forEach((flowSetting, index) => {
            values[index] = (_: any) => {
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

                const syntaxSegment = values[index]
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

    const [inputs, validate] = useForm<Record<number | "inputType", InputSyntaxSegment[]>>({
        initialValues: initialValues,
        validate: validations,
        truthyValidationBeforeSubmit: false,
        useInitialValidation: true,
        onSubmit: onSubmit
    })

    return <Flex style={{gap: ".7rem", flexDirection: "column"}}>
        {

            (flowInputType && flowInputType != "void") && (flowTypeInputType && flowTypeInputType != "void") ? <DataTypeTypeInputComponent
                flowId={instance.id}
                title={"Input type"}
                description={"The type of the input that will be provided to the flow when it is triggered."}
                onChange={() =>  validate()}
                {...inputs.getInputProps("inputType")}
            /> : null

        }
        {definition?.flowTypeSettings?.map((settingDefinition, index) => {

            if (!settingDefinition) return null

            const title = settingDefinition.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_SETTING_NAME
            const description = settingDefinition?.descriptions?.[0]?.content ?? FALLBACK_FLOW_TYPE_SETTING_DESCRIPTION

            return <div>
                {/*@ts-ignore*/}
                <DataTypeInputComponent flowId={instance.id}
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
                                        {...inputs.getInputProps(index)}
                />
            </div>

        })}
    </Flex>
}
