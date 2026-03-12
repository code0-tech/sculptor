import React from "react";
import {Flex, InputSyntaxSegment, useForm, useService, useStore} from "@code0-tech/pictor";
import {
    Flow,
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    Scalars
} from "@code0-tech/sagittarius-graphql-types";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {useNodeValidation} from "@edition/flow/hooks/NodeValidation.hook";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";

export interface FunctionFileDefaultComponentProps {
    node: NodeFunction
    flowId: Flow['id']
}

export const FunctionFileDefaultComponent: React.FC<FunctionFileDefaultComponentProps> = (props) => {

    const {node, flowId} = props

    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const fileTabsService = useService(FileTabsService)
    const validation = useNodeValidation(node.id, flowId)

    const changedParameters = React.useRef<Set<number>>(new Set())
    const [, startTransition] = React.useTransition()

    const definition = React.useMemo(() => {
        return functionService.getById(node.functionDefinition?.id!!)
    }, [functionStore])

    const initialValues = React.useMemo(() => {
        const values: Record<string, any> = {}
        definition?.parameterDefinitions?.forEach((parameter, index) => {
            const nodeParameter = node.parameters?.nodes?.[index]
            values[index] = nodeParameter?.value?.__typename === "LiteralValue" ? (typeof nodeParameter.value?.value === "object" && nodeParameter.value?.value != null ? JSON.stringify(nodeParameter.value?.value) : nodeParameter.value.value) : nodeParameter?.value != null ? JSON.stringify(nodeParameter?.value) : nodeParameter?.value
        })
        return values
    }, [node])

    const validations = React.useMemo(() => {
        const values: Record<string, any> = {}
        node.parameters?.nodes?.forEach((parameter, index) => {
            values[index] = (_: any) => {
                const validationForParameter = validation?.find(v => v.parameterIndex === index)
                if (validationForParameter) {
                    return validationForParameter.message!![0]?.content || "Invalid value"
                }
                return null
            }
        })
        return values
    }, [node, validation])

    const onSubmit = React.useCallback((values: any) => {
        startTransition(async () => {
            for (const parameterDefinition of definition?.parameterDefinitions!) {
                const parameterIndex = definition?.parameterDefinitions?.findIndex(p => p?.id === parameterDefinition.id)
                if (!parameterIndex) return
                if (!changedParameters.current.has(parameterIndex)) continue;
                const nodeParameter = node.parameters?.nodes?.find(p => p?.parameterDefinition?.id === parameterDefinition.id)
                const syntaxSegment = values[parameterIndex]
                const previousValue = nodeParameter?.value as NodeParameterValue
                const syntaxValue = syntaxSegment?.[0]?.value ?? syntaxSegment?.value ?? syntaxSegment as NodeFunction | LiteralValue | ReferenceValue

                if (previousValue && previousValue.__typename === "NodeFunctionIdWrapper" && previousValue.id) {
                    const linkedNodes = flowService.getLinkedNodesById(flowId, previousValue.id)
                    linkedNodes.reverse().forEach(node => {
                        if (node.id) fileTabsService.deleteById(node.id)
                    })
                }

                if (!syntaxValue || !syntaxSegment) {
                    await flowService.setParameterValue(flowId, node.id!!, parameterIndex, undefined, parameterDefinition.id);
                }

                try {
                    const parsedSyntaxValue = Number.isNaN(Number(syntaxValue)) ? JSON.parse(syntaxValue) : syntaxValue
                    if (!parsedSyntaxValue?.__typename) {
                        await flowService.setParameterValue(flowId, node.id!!, parameterIndex, syntaxValue ? {
                            __typename: "LiteralValue",
                            value: parsedSyntaxValue === null || parsedSyntaxValue === undefined ? String(parsedSyntaxValue) : parsedSyntaxValue
                        } : undefined, parameterDefinition.id);
                        continue;
                    }
                } catch (e) {
                    if (!syntaxValue?.__typename) {
                        await flowService.setParameterValue(flowId, node.id!!, parameterIndex, syntaxValue ? {
                            __typename: "LiteralValue",
                            value: syntaxValue,
                        } : undefined, parameterDefinition.id);
                        continue;
                    }
                }

                const parsedSyntaxValue = typeof syntaxValue === "object" ? syntaxValue : JSON.parse(syntaxValue)

                await flowService.setParameterValue(flowId, node.id!!, parameterIndex, parsedSyntaxValue.__typename === "LiteralValue" ? (!!parsedSyntaxValue.value ? parsedSyntaxValue : undefined) : parsedSyntaxValue, parameterDefinition.id);
            }
            changedParameters.current.clear()
        })
    }, [flowStore])

    const [inputs, validate] = useForm<Record<number, InputSyntaxSegment[]>>({
        initialValues: initialValues,
        validate: validations,
        truthyValidationBeforeSubmit: false,
        onSubmit: onSubmit
    })

    return <Flex style={{gap: ".7rem", flexDirection: "column"}}>
        {definition?.parameterDefinitions?.map((parameterDefinition, index) => {

            if (!parameterDefinition) return null

            const nodeParameter = node.parameters?.nodes?.find(p => p?.parameterDefinition?.id === parameterDefinition.id)

            const title = parameterDefinition?.names ? parameterDefinition?.names!![0]?.content : parameterDefinition?.id
            const description = parameterDefinition?.descriptions ? parameterDefinition?.descriptions!![0]?.content : JSON.stringify(parameterDefinition?.dataTypeIdentifier)

            return <div>
                {/*@ts-ignore*/}
                <DataTypeInputComponent flowId={flowId}
                                        nodeId={node.id}
                                        parameterIndex={index}
                                        title={title}
                                        description={description}
                                        clearable
                                        onChange={() => {
                                            changedParameters.current.add(index)
                                            validate()
                                        }}
                                        {...inputs.getInputProps(index)}
                />
            </div>
        })}
    </Flex>
}
