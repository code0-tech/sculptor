import React from "react";
import {
    Flex,
    useService
} from "@code0-tech/pictor";
import {Flow, LiteralValue, NodeParameterValue, Scalars} from "@code0-tech/sagittarius-graphql-types";
import {FunctionSuggestion} from "@edition/function/components/FunctionSuggestion.view";
import {useValueSuggestions} from "@edition/function/hooks/FunctionValueSuggestions.hook";
import {useDataTypeSuggestions} from "@edition/function/hooks/FunctionDataTypeSuggestions.hook";
import {DFlowInputDataType} from "@code0-tech/pictor/dist/components/d-flow-input/DFlowInputDataType";
import {DFlowInputDefault} from "@code0-tech/pictor/dist/components/d-flow-input/DFlowInputDefault";
import {toInputSuggestions} from "@edition/function/components/FunctionSuggestionMenu.util";
import {FlowTypeService} from "@edition/flowtype/services/FlowTypeService";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

export interface FunctionFileTriggerProps {
    instance: Flow
}

export const FunctionFileTrigger: React.FC<FunctionFileTriggerProps> = (props) => {

    const {instance} = props

    const flowTypeService = useService(FlowTypeService)
    const flowService = useService(FlowService)
    const dataTypeService = useService(DatatypeService)
    const [, startTransition] = React.useTransition()

    const definition = flowTypeService.getById(instance.type?.id!!)

    const suggestionsById: Record<string, FunctionSuggestion[]> = {}
    definition?.flowTypeSettings?.forEach(settingDefinition => {
        const dataTypeIdentifier = {dataType: settingDefinition.dataType}
        const valueSuggestions = useValueSuggestions(dataTypeIdentifier)
        const dataTypeSuggestions = useDataTypeSuggestions(dataTypeIdentifier)
        suggestionsById[settingDefinition.identifier!!] = [
            ...valueSuggestions,
            ...dataTypeSuggestions,
        ].sort()
    })

    const testDataType = dataTypeService.getTypeFromValue({
        __typename: "LiteralValue",
        value: {
            body: {
                users: [
                    {
                        username: "john_doe",
                        email: "test@test.de",
                    }
                ],
                test: "sd"
            },
            headers: {
                username: "john_doe",
                email: "sd",
            }
        }
    })

    return <Flex style={{gap: ".7rem", flexDirection: "column"}}>
        {definition?.inputType ? <DFlowInputDataType
            initialValue={testDataType || undefined}
            label={"Test Data Type"}
            description={"Data type used for testing"}
            onChange={(dataTypeIdentifier) => console.log(dataTypeIdentifier)}/> : null}
        {definition?.flowTypeSettings?.map(settingDefinition => {
            const setting = instance.settings?.nodes?.find(s => s?.flowSettingIdentifier == settingDefinition.identifier)
            const title = settingDefinition.names!![0]?.content ?? ""
            const description = settingDefinition?.descriptions!![0]?.content ?? ""
            const result = suggestionsById[settingDefinition.identifier!!]


            const defaultValue = setting?.value?.__typename === "LiteralValue" ? typeof setting?.value == "object" ? JSON.stringify(setting?.value) : setting?.value : typeof setting?.value == "object" ? JSON.stringify(setting?.value) : setting?.value

            const submitValue = (value: NodeParameterValue) => {
                startTransition(async () => {
                    if (value?.__typename == "LiteralValue" && settingDefinition.identifier) {
                        await flowService.setSettingValue(props.instance.id, String(settingDefinition.identifier), value.value)
                    } else if (settingDefinition.identifier) {
                        await flowService.setSettingValue(props.instance.id, String(settingDefinition.identifier), value)
                    }
                })

            }

            const submitValueEvent = (event: any) => {
                try {
                    const value = JSON.parse(event.target.value) as Scalars['JSON']['output']
                    if (value.__typename == "LiteralValue") {
                        submitValue(value.value)
                        return
                    }
                    submitValue(value)
                } catch (e) {
                    submitValue({
                        value: event.target.innerText,
                        __typename: "LiteralValue"
                    } as LiteralValue)
                }
            }

            return <div>
                <DFlowInputDefault flowId={undefined}
                                   nodeId={undefined}
                                   parameterId={undefined}
                                   title={title}
                                   description={description}
                                   clearable
                                   key={settingDefinition.identifier}
                                   defaultValue={defaultValue}
                                   onBlur={submitValueEvent}
                                   onClear={submitValueEvent}
                                   onSuggestionSelect={(suggestion) => {
                                       submitValue(suggestion.value)
                                   }}
                                   suggestions={toInputSuggestions(result)}
                />
            </div>
        })}
    </Flex>
}
