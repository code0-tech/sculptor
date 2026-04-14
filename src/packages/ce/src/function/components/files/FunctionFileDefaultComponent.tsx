import React, {startTransition} from "react";
import {Alert, InputSyntaxSegment, Spacing, Text, useForm, useService, useStore} from "@code0-tech/pictor";
import {
    Flow,
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue
} from "@code0-tech/sagittarius-graphql-types";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {
    FALLBACK_FUNCTION_PARAMETER_DESCRIPTION,
    FALLBACK_FUNCTION_PARAMETER_NAME
} from "@core/util/fallback-translations";

export interface FunctionFileDefaultComponentProps {
    node: NodeFunction
    flowId: Flow['id']
}

export const FunctionFileDefaultComponent: React.FC<FunctionFileDefaultComponentProps> = (props) => {

    const {node, flowId} = props

    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowService = useService(FlowService)
    const fileTabsService = useService(FileTabsService)
    const changedParameters = React.useRef<Set<number>>(new Set())
    const validation = useFlowValidation(flowId)

    const definition = React.useMemo(() => {
        return functionService.getById(node.functionDefinition?.id!!)
    }, [functionStore])

    const initialValues = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.parameterDefinitions?.nodes?.forEach((parameter, index) => {
            const nodeParameter = node.parameters?.nodes?.[index]
            values[parameter!.id!] = nodeParameter?.value?.__typename === "LiteralValue" ? (typeof nodeParameter.value?.value === "object" && nodeParameter.value?.value != null ? JSON.stringify(nodeParameter.value?.value) : nodeParameter.value.value) : nodeParameter?.value != null ? JSON.stringify(nodeParameter?.value) : nodeParameter?.value
        })
        return values
    }, [node, definition])

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
        startTransition(async () => {
            for (const parameterDefinition of definition?.parameterDefinitions?.nodes!) {
                const parameterIndex = definition?.parameterDefinitions?.nodes?.findIndex(p => p?.id === parameterDefinition?.id)
                if (typeof parameterIndex !== "number") return
                if (!changedParameters.current.has(parameterIndex)) continue;
                const nodeParameter = node.parameters?.nodes?.[parameterIndex]
                const value = values[parameterDefinition!.id!]
                const previousValue = nodeParameter?.value as NodeParameterValue
                const syntaxValue = (value?.[0]?.type == "block" || value?.[0]?.type == "text" ? value?.[0]?.value : value) ?? null as NodeFunction | LiteralValue | ReferenceValue | null

                if (previousValue && previousValue.__typename === "NodeFunctionIdWrapper" && previousValue.id) {
                    const linkedNodes = flowService.getLinkedNodesById(flowId, previousValue.id)
                    linkedNodes.reverse().forEach(node => {
                        if (node.id) fileTabsService.deleteById(node.id)
                    })
                }

                if (!syntaxValue || !value || (Array.isArray(syntaxValue) && Array.from(syntaxValue).length <= 0)) {
                    await flowService.setParameterValue(flowId, node.id!!, parameterIndex, undefined, definition);
                    continue;
                }

                try {
                    const parsedSyntaxValue = JSON.parse(syntaxValue)
                    if (!parsedSyntaxValue?.__typename) {
                        await flowService.setParameterValue(flowId, node.id!!, parameterIndex, syntaxValue ? {
                            __typename: "LiteralValue",
                            value: parsedSyntaxValue
                        } : undefined, definition);
                        continue;
                    }
                } catch (e) {
                    if (!syntaxValue?.__typename) {
                        await flowService.setParameterValue(flowId, node.id!!, parameterIndex, syntaxValue ? {
                            __typename: "LiteralValue",
                            value: syntaxValue,
                        } : undefined, definition);
                        continue;
                    }
                }

                const parsedSyntaxValue = typeof syntaxValue === "object" ? syntaxValue : JSON.parse(syntaxValue)

                await flowService.setParameterValue(flowId, node.id!!, parameterIndex, parsedSyntaxValue.__typename === "LiteralValue" ? (!!parsedSyntaxValue.value ? parsedSyntaxValue : undefined) : parsedSyntaxValue, definition);
            }
            changedParameters.current.clear()
        })
    }, [flowService])

    const [inputs, validate] = useForm<Record<string, InputSyntaxSegment[]>>({
        useInitialValidation: true,
        truthyValidationBeforeSubmit: false,
        initialValues: initialValues,
        validate: parameterValidations,
        onSubmit: onSubmit
    })

    React.useEffect(() => {
        validate()
    }, [validation])

    return <>
        <Text size={"md"}>{definition?.names?.[0].content}</Text>
        <Spacing spacing={"xs"}/>
        <Text hierarchy={"tertiary"}>{definition?.descriptions?.[0].content}</Text>
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
                {/*@ts-ignore*/}
                <DataTypeInputComponent flowId={flowId}
                                        nodeId={node.id}
                                        parameterIndex={index}
                                        title={title}
                                        description={description}
                                        clearable
                                        onChange={() => {
                                            //TODO this should be debounced
                                            changedParameters.current.add(index)
                                            validate()
                                        }}
                                        {...inputs.getInputProps(parameterDefinition.id!)}
                />
                <Spacing spacing={"xl"}/>
            </div>
        })}
    </>
}
