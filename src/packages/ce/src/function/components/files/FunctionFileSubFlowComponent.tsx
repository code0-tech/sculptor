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
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import {
    FALLBACK_FUNCTION_DESCRIPTION,
    FALLBACK_FUNCTION_NAME,
    FALLBACK_FUNCTION_PARAMETER_DESCRIPTION,
    FALLBACK_FUNCTION_PARAMETER_NAME
} from "@core/util/fallback-translations";
import {getTypeSchema} from "@code0-tech/triangulum";
import * as Collapsible from "@radix-ui/react-collapsible";
import {IconChevronDown, IconLink, IconLinkOff} from "@tabler/icons-react";

export interface FunctionFileSubFlowComponentProps {
    flowId: Flow['id']
    nodeId: NodeFunction['id']
    functionId: FunctionDefinition['id']
}

export const FunctionFileSubFlowComponent: React.FC<FunctionFileSubFlowComponentProps> = (props) => {

    const {flowId, nodeId, functionId} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)

    const [uncontrolledParameters, setUncontrolledParameters] = React.useState<Record<string, boolean>>({})

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

    const parameterSchemas = React.useMemo(() => {
        const signature = definition?.signature
        if (!signature) return []

        const open = signature.indexOf("(")
        if (open < 0) return []

        const close = signature.slice(open).split("").reduce<{ depth: number, index: number }>((found, character, index) => {
            if (found.index >= 0) return found
            const depth = found.depth + (character === "(" ? 1 : character === ")" ? -1 : 0)
            return {depth, index: depth === 0 && character === ")" ? open + index : -1}
        }, {depth: 0, index: -1}).index
        if (close <= open) return []

        const inner = signature.slice(open + 1, close)
        const parameters = inner.split("").reduce<{ depth: number, parts: string[] }>((split, character, index) => {
            const opens = ["<", "(", "[", "{"].includes(character)
            const closes = [">", ")", "]", "}"].includes(character) && inner[index - 1] !== "="
            const depth = split.depth + (opens ? 1 : closes ? -1 : 0)
            if (character === "," && split.depth === 0) return {depth, parts: [...split.parts, ""]}
            return {depth, parts: [...split.parts.slice(0, -1), split.parts[split.parts.length - 1] + character]}
        }, {depth: 0, parts: [""]}).parts

        const dataTypes = dataTypeService.values()

        return parameters.map(parameter => {
            const colon = parameter.indexOf(":")
            if (colon < 0) return undefined
            return getTypeSchema(parameter.slice(colon + 1).trim(), dataTypes)
        })
    }, [definition?.signature, dataTypeService, dataTypeStore])

    const initialValues = React.useMemo(
        () => Object.fromEntries((definition?.parameterDefinitions?.nodes ?? []).map(parameter => [parameter!.id!, undefined])),
        [definition]
    )

    const [inputs] = useForm<Record<string, NodeParameterValue | undefined>>({
        useInitialValidation: true,
        truthyValidationBeforeSubmit: false,
        initialValues: initialValues,
        onSubmit: () => undefined
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
                const isControlled = !uncontrolledParameters[parameterDefinition.id!]

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
                                                  onClick={() => setUncontrolledParameters(current => ({
                                                      ...current,
                                                      [parameterDefinition.id!]: false
                                                  }))}>
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
                                                        schema={parameterSchemas[index]!}
                                                        clearable
                                                        flowId={flowId}
                                                        {...inputs.getInputProps(parameterDefinition.id!)}/>
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
