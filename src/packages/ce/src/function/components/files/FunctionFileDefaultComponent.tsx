import React from "react";
import {Alert, Spacing, Text, useForm, useService} from "@code0-tech/pictor";
import {
    Flow,
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {
    FALLBACK_FUNCTION_DESCRIPTION,
    FALLBACK_FUNCTION_NAME,
    FALLBACK_FUNCTION_PARAMETER_DESCRIPTION,
    FALLBACK_FUNCTION_PARAMETER_NAME
} from "@core/util/fallback-translations";
import {useNodes, useNodesData} from "@xyflow/react";
import {NodeSchema} from "@code0-tech/triangulum";

export interface FunctionFileDefaultComponentProps {
    node: NodeFunction
    flowId: Flow['id']
}

export const FunctionFileDefaultComponent: React.FC<FunctionFileDefaultComponentProps> = (props) => {

    const {node, flowId} = props

    const flowService = useService(FlowService)
    const validation = useFlowValidation(flowId)
    const changedParameter = React.useRef<Set<string>>(new Set())

    const definition = React.useMemo(
        () => node.functionDefinition!,
        [node.functionDefinition]
    )

    const initialValues = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.parameterDefinitions?.nodes?.forEach((parameter, index) => {
            const nodeParameter = node.parameters?.nodes?.[index]
            values[parameter!.id!] = nodeParameter?.value
        })
        return values
    }, [node, definition])

    const flowNode = useNodes().find(value => value.id == node.id)

    const nodeValidation = React.useMemo(
        () => validation?.find(v => v.nodeId === node.id && v.parameterIndex === null),
        [validation?.length]
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
    }, [validation?.length, node.id, definition])

    const onSubmit = React.useCallback((values: Record<string, NodeParameterValue | undefined>) => {
        for (const parameterDefinition of definition?.parameterDefinitions?.nodes ?? []) {

            if (!changedParameter.current.has(parameterDefinition?.id!)) continue

            const parameterIndex = definition?.parameterDefinitions?.nodes?.findIndex(p => p?.id === parameterDefinition?.id)
            if (typeof parameterIndex !== "number") return

            const value = values[parameterDefinition!.id!]
            flowService.setParameterValue(flowId, node.id!!, parameterIndex, (value ?? undefined) as SubFlowValue | ReferenceValue | LiteralValue | undefined, definition);

            changedParameter.current.delete(parameterDefinition?.id!)
        }
    }, [flowService, definition])

    const [inputs, validate] = useForm<Record<string, NodeParameterValue | undefined>>({
        useInitialValidation: true,
        truthyValidationBeforeSubmit: false,
        initialValues: initialValues,
        validate: parameterValidations,
        onSubmit: onSubmit
    })

    React.useEffect(
        () => validate(undefined, false),
        [validation]
    )

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

            const schema = (flowNode?.data?.schema as NodeSchema[])?.[index]
     /*       schema.blocked = schema?.blockedBy?.some(blockedBy => {
                const val = node.parameters?.nodes?.[blockedBy]?.value;
                return val === undefined || val === null;
            }) ?? false;*/

            return <div>
                <DataTypeInputComponent data-qa-selector={"flow-builder-parameter"}
                                        title={title}
                                        schema={schema}
                                        description={description}
                                        clearable
                                        key={parameterDefinition.id}
                                        onChange={() => {
                                            changedParameter.current.add(parameterDefinition.id!)
                                            validate()
                                        }}
                                        {...inputs.getInputProps(parameterDefinition.id!)}
                />
                <Spacing spacing={"xl"}/>
            </div>
        })}
    </>
}
