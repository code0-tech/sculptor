import React from "react";
import {Alert, InputSyntaxSegment, Spacing, Text, useForm, useService} from "@code0-tech/pictor";
import {Flow, LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {
    FALLBACK_FUNCTION_DESCRIPTION,
    FALLBACK_FUNCTION_NAME,
    FALLBACK_FUNCTION_PARAMETER_DESCRIPTION,
    FALLBACK_FUNCTION_PARAMETER_NAME
} from "@core/util/fallback-translations";
import {useNodes} from "@xyflow/react";
import {NodeSchema} from "@code0-tech/triangulum";

export interface FunctionFileDefaultComponentProps {
    node: NodeFunction
    flowId: Flow['id']
}

export const FunctionFileDefaultComponent: React.FC<FunctionFileDefaultComponentProps> = (props) => {

    const {node, flowId} = props

    const flowService = useService(FlowService)
    const changedParameters = React.useRef<Set<number>>(new Set())
    const validation = useFlowValidation(flowId)

    const definition = React.useMemo(
        () => node.functionDefinition!,
        [node]
    )

    const initialValues = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.parameterDefinitions?.nodes?.forEach((parameter, index) => {
            const nodeParameter = node.parameters?.nodes?.[index]
            values[parameter!.id!] = nodeParameter?.value?.__typename === "LiteralValue" ? (typeof nodeParameter.value?.value === "object" && nodeParameter.value?.value != null ? JSON.stringify(nodeParameter.value?.value) : nodeParameter.value.value) : nodeParameter?.value != null ? JSON.stringify(nodeParameter?.value) : nodeParameter?.value
        })
        return values
    }, [node, definition])

    const flowNode = useNodes().find(value => value.id == node.id)

    const nodeValidation = React.useMemo(
        () => validation?.find(v => v.nodeId === node.id && v.parameterIndex === null),
        [validation]
    )

    const parameterValidations = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.parameterDefinitions?.nodes?.forEach((parameter, index) => {
            values[parameter!.id!] = (_: any) => {
                const validationForParameter = validation?.find(v => v.parameterIndex === index && v.nodeId === node.id)
                if (validationForParameter) {
                    return validationForParameter?.message?.[0]?.content ?? "Invalid value"
                }
                return null
            }
        })
        return values
    }, [validation, flowId, node, definition])

    const onSubmit = React.useCallback((values: any) => {
        for (const parameterDefinition of definition?.parameterDefinitions?.nodes ?? []) {
            const parameterIndex = definition?.parameterDefinitions?.nodes?.findIndex(p => p?.id === parameterDefinition?.id)
            if (typeof parameterIndex !== "number") return
            //if (!changedParameters.current.has(parameterIndex)) continue;
            const value = values[parameterDefinition!.id!]
            const syntaxValue = (value?.[0]?.type == "block" || value?.[0]?.type == "text" ? value?.[0]?.value : value) ?? null as NodeFunction | LiteralValue | ReferenceValue | null

            if (!syntaxValue || !value || (Array.isArray(syntaxValue) && Array.from(syntaxValue).length <= 0)) {
                flowService.setParameterValue(flowId, node.id!!, parameterIndex, undefined, definition);
                continue;
            }

            try {
                const parsedSyntaxValue = JSON.parse(syntaxValue)
                if (!parsedSyntaxValue?.__typename) {
                    flowService.setParameterValue(flowId, node.id!!, parameterIndex, syntaxValue ? {
                        __typename: "LiteralValue",
                        value: parsedSyntaxValue
                    } : undefined, definition);
                    continue;
                }
            } catch (e) {
                if (!syntaxValue?.__typename) {
                    flowService.setParameterValue(flowId, node.id!!, parameterIndex, syntaxValue ? {
                        __typename: "LiteralValue",
                        value: syntaxValue,
                    } : undefined, definition);
                    continue;
                }
            }

            const parsedSyntaxValue = typeof syntaxValue === "object" ? syntaxValue : JSON.parse(syntaxValue)

            flowService.setParameterValue(flowId, node.id!!, parameterIndex, parsedSyntaxValue.__typename === "LiteralValue" ? (!!parsedSyntaxValue.value ? parsedSyntaxValue : undefined) : parsedSyntaxValue, definition);
        }
        changedParameters.current.clear()
    }, [flowService, definition])

    const [inputs, validate] = useForm<Record<string, InputSyntaxSegment[]>>({
        useInitialValidation: true,
        truthyValidationBeforeSubmit: false,
        initialValues: initialValues,
        validate: parameterValidations,
        onSubmit: onSubmit
    })

    React.useEffect(() => {
        validate()
    }, [validation?.length])

    return <>
        <Text size={"md"}>{definition?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME}</Text>
        <Spacing spacing={"xs"}/>
        <Text hierarchy={"tertiary"}>{definition?.descriptions?.[0]?.content ?? FALLBACK_FUNCTION_DESCRIPTION}</Text>
        {
            nodeValidation && <>
                <Spacing spacing={"xl"}/>
                <Alert color={"error"}>
                    {nodeValidation?.message?.[0]?.content as string}
                </Alert>
            </>
        }
        <Spacing spacing={"xl"}/>
        <Text size={"md"}>Parameters</Text>
        <Spacing spacing={"xs"}/>
        {definition?.parameterDefinitions?.nodes?.map((parameterDefinition, index) => {

            if (!parameterDefinition) return null

            const title = parameterDefinition?.names?.[0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME
            const description = parameterDefinition?.descriptions?.[0]?.content ?? FALLBACK_FUNCTION_PARAMETER_DESCRIPTION

            return <div>
                <DataTypeInputComponent data-qa-selector={"flow-builder-parameter"}
                                        title={title}
                                        schema={(flowNode?.data?.schema as NodeSchema[])?.[index]}
                                        description={description}
                                        clearable
                                        onChange={() =>  validate()}
                                        {...inputs.getInputProps(parameterDefinition.id!)}
                />
                <Spacing spacing={"xl"}/>
            </div>
        })}
    </>
}
