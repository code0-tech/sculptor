import React from "react";
import {
    Button,
    Card,
    Flex,
    InputDescription,
    Spacing,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {Flow, FunctionDefinition, NodeFunction, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {
    FALLBACK_FUNCTION_DESCRIPTION,
    FALLBACK_FUNCTION_NAME,
    FALLBACK_FUNCTION_PARAMETER_DESCRIPTION,
    FALLBACK_FUNCTION_PARAMETER_NAME
} from "@core/util/fallback-translations";
import {useSubFlowSchema} from "@edition/flow/hooks/Flow.subFlowSchema.hook";
import * as Collapsible from "@radix-ui/react-collapsible";
import {IconChevronDown, IconLink, IconLinkOff} from "@tabler/icons-react";

export interface FunctionFileSubFlowComponentProps {
    flowId: Flow['id']
    nodeId: NodeFunction['id']
    functionId: FunctionDefinition['id']
    parameterIndex: number
    referenceSignature?: string
}

export const FunctionFileSubFlowComponent: React.FC<FunctionFileSubFlowComponentProps> = (props) => {

    const {flowId, nodeId, functionId, parameterIndex, referenceSignature} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const [uncontrolledParameters, setUncontrolledParameters] = React.useState<Record<string, boolean | undefined>>({})
    const changedParameter = React.useRef<Set<string>>(new Set())
    const castByParameter = React.useRef<Map<string, string | null>>(new Map())

    const subFlow = React.useMemo(
        () => flowService.getSubFlowValue(flowId, nodeId, parameterIndex, referenceSignature),
        [flowService, flowStore, flowId, nodeId, parameterIndex, referenceSignature]
    )

    const parentNode = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowService, flowStore, flowId, nodeId]
    )

    const parentDefinition = React.useMemo(
        () => functionService.getById(parentNode?.functionDefinition?.id),
        [functionService, functionStore, parentNode?.functionDefinition?.id]
    )

    const definition = React.useMemo(
        () => functionService.getById(functionId),
        [functionService, functionStore, functionId]
    )

    const schemas = useSubFlowSchema(flowId, nodeId, parameterIndex, referenceSignature)

    const initialValues = React.useMemo(() => Object.fromEntries((definition?.parameterDefinitions?.nodes ?? []).map(parameter =>
        [parameter!.id!, subFlow?.parameters?.find(candidate => candidate?.identifier === parameter?.identifier)?.value ?? undefined]
    )), [definition, subFlow])

    const onSubmit = React.useCallback((values: Record<string, NodeParameterValue | undefined>) => {
        (definition?.parameterDefinitions?.nodes ?? []).forEach(parameterDefinition => {
            if (!changedParameter.current.has(parameterDefinition?.id!)) return
            changedParameter.current.delete(parameterDefinition?.id!)
            const cast = castByParameter.current.get(parameterDefinition!.id!)
            flowService.setSubFlowParameterValue(flowId, nodeId, parameterIndex, referenceSignature, parameterDefinition!.identifier!, values[parameterDefinition!.id!], cast)
        })
    }, [flowService, definition, flowId, nodeId, parameterIndex, referenceSignature])

    const [inputs, validate] = useForm<Record<string, NodeParameterValue | undefined>>({
        useInitialValidation: true,
        truthyValidationBeforeSubmit: false,
        initialValues: initialValues,
        onSubmit: onSubmit
    })

    const parentName = parentDefinition?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME

    return <div style={{
        padding: "0.7rem"
    }}>
        <Text size={"md"}>{definition?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME}</Text>
        <Spacing spacing={"xs"}/>
        <Text hierarchy={"tertiary"}>{definition?.descriptions?.[0]?.content ?? FALLBACK_FUNCTION_DESCRIPTION}</Text>
        <Spacing spacing={"xl"}/>
        <Text size={"md"}>Parameters</Text>
        <Spacing spacing={"xs"}/>
        {(() => {
            const indexedParameters = definition?.parameterDefinitions?.nodes
                ?.map((parameterDefinition, index) => ({parameterDefinition, index}))
                ?.filter(({parameterDefinition}) => parameterDefinition && !parameterDefinition.hidden) ?? []

            const requiredParameters = indexedParameters.filter(({parameterDefinition}) => !parameterDefinition!.optional)
            const optionalParameters = indexedParameters.filter(({parameterDefinition}) => parameterDefinition!.optional)

            const renderParameter = (parameterDefinition: NonNullable<typeof indexedParameters[number]['parameterDefinition']>, index: number) => {
                const title = parameterDefinition?.names?.[0]?.content ?? FALLBACK_FUNCTION_PARAMETER_NAME
                const description = parameterDefinition?.descriptions?.[0]?.content ?? FALLBACK_FUNCTION_PARAMETER_DESCRIPTION
                const parameter = subFlow?.parameters?.find(candidate => candidate?.identifier === parameterDefinition.identifier)
                const isControlled = !(uncontrolledParameters[parameterDefinition.id!] ?? !!parameter?.value)
                const inputProps = inputs.getInputProps(parameterDefinition.id!)

                return <div key={parameterDefinition.id}>
                    <Text size={"md"}>{title}</Text>
                    <Spacing spacing={"xs"}/>
                    <InputDescription>{description}</InputDescription>
                    <Spacing spacing={"xs"}/>
                    <Flex align={"stretch"} style={{gap: "0.35rem"}}>
                        {
                            !isControlled ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div style={{display: "flex", flexShrink: 0}}>
                                            <Card color={"primary"}
                                                  paddingSize={"xxs"}
                                                  clickable
                                                  display={"flex"}
                                                  align={"center"}
                                                  justify={"center"}
                                                  miw={"1.75rem"}
                                                  bg={"rgba(7,5,20, 0.5)"}
                                                  style={{
                                                      backdropFilter: "blur(0.25rem)",
                                                      WebkitBackdropFilter: "blur(0.25rem)"
                                                  }}
                                                  onClick={() => {
                                                      setUncontrolledParameters(current => ({
                                                          ...current,
                                                          [parameterDefinition.id!]: false
                                                      }))
                                                      inputProps.formValidation?.setValue?.(null)
                                                      changedParameter.current.add(parameterDefinition.id!)
                                                      validate()
                                                  }}>
                                                <IconLinkOff size={13}/>
                                            </Card>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipPortal>
                                        <TooltipContent sideOffset={8} color={"secondary"}>
                                            <Text size={"sm"}>{`Let ${parentName} control this value again`}</Text>
                                        </TooltipContent>
                                    </TooltipPortal>
                                </Tooltip>
                            ) : null
                        }
                        <div style={{position: "relative", flex: 1, minWidth: 0}}>
                            <div inert={isControlled}>
                                <DataTypeInputComponent data-qa-selector={"flow-builder-sub-flow-parameter"}
                                                        schema={schemas[index]!}
                                                        clearable
                                                        flowId={flowId}
                                                        cast={parameter?.cast ?? null}
                                                        onChange={() => {
                                                            changedParameter.current.add(parameterDefinition.id!)
                                                            validate()
                                                        }}
                                                        onCastChange={changedCast => {
                                                            castByParameter.current.set(parameterDefinition.id!, changedCast)
                                                            changedParameter.current.add(parameterDefinition.id!)
                                                            validate()
                                                        }}
                                                        {...inputProps}
                                                        formValidation={{
                                                            ...inputProps.formValidation,
                                                            setValue: (value: NodeParameterValue | NodeFunction | null) => {
                                                                if (value?.__typename !== "NodeFunction") return inputProps.formValidation?.setValue?.(value)
                                                                const addedNodeId = flowService.addPreviousNodeById(flowId, nodeId, value)
                                                                if (addedNodeId) inputProps.formValidation?.setValue?.({
                                                                    __typename: "ReferenceValue",
                                                                    nodeFunctionId: addedNodeId
                                                                })
                                                            }
                                                        }}/>
                            </div>
                            {
                                isControlled ? (
                                    <Card data-qa-selector={"flow-builder-sub-flow-parameter-overlay"}
                                          color={"primary"}
                                          paddingSize={"xxs"}
                                          pos={"absolute"}
                                          top={"0"}
                                          left={"0"}
                                          w={"100%"}
                                          h={"100%"}
                                          display={"flex"}
                                          align={"center"}
                                          justify={"center"}
                                          bg={"rgba(7,5,20, 0.5)"}
                                          style={{
                                              zIndex: 2,
                                              gap: "0.35rem",
                                              cursor: "pointer",
                                              backdropFilter: "blur(0.25rem)",
                                              WebkitBackdropFilter: "blur(0.25rem)"
                                          }}
                                          onClick={() => setUncontrolledParameters(current => ({
                                              ...current,
                                              [parameterDefinition.id!]: true
                                          }))}>
                                        <IconLink size={13}/>
                                        <Text size={"sm"}>{`${parentName} controls this value`}</Text>
                                    </Card>
                                ) : null
                            }
                        </div>
                    </Flex>
                    <Spacing spacing={"xl"}/>
                </div>
            }

            return <>
                {requiredParameters.map(({parameterDefinition, index}) => renderParameter(parameterDefinition!, index))}
                {optionalParameters.length > 0 && (
                    <Collapsible.Root>
                        <Collapsible.Trigger asChild>
                            <Flex justify={"space-between"} align={"center"} style={{gap: "0.7rem"}}>
                                <Text size={"md"}>Optional parameters</Text>
                                <Button variant={"none"} color={"primary"} paddingSize={"xxs"}>
                                    <IconChevronDown size={16}/>
                                </Button>
                            </Flex>
                        </Collapsible.Trigger>
                        <Spacing spacing={"md"}/>
                        <Collapsible.Content>
                            {optionalParameters.map(({parameterDefinition, index}) => renderParameter(parameterDefinition!, index))}
                        </Collapsible.Content>
                    </Collapsible.Root>
                )}
            </>
        })()}
    </div>
}
