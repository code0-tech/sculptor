import React from "react";
import {
    Badge,
    Button,
    Card,
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    getSize,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {Flow, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {Suggestion, SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FUNCTION_DISPLAY_MESSAGE} from "@core/util/fallback-translations";
import {
    SuggestionVariantPreviewComponent
} from "@edition/function/components/suggestion/SuggestionVariantPreviewComponent";
import "@edition/function/components/nodes/FunctionNodeComponent.style.scss";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";

export interface SuggestionVariantDialogComponentProps {
    suggestion?: Suggestion | null
    flowId?: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onVariantSelect?: (value: SuggestionValue) => void
    onBackSelect?: () => void
}

export const SuggestionVariantDialogComponent: React.FC<SuggestionVariantDialogComponentProps> = (props) => {

    const {suggestion, flowId, nodeId, parameterIndex, open, onOpenChange, onVariantSelect, onBackSelect} = props

    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const definition = React.useMemo(() => {
        const suggested = suggestion?.variants
            .map(variant => variant.__typename === "NodeFunction" || variant.__typename === "SubFlowValue"
                ? variant.functionDefinition
                : undefined)
            .find(functionDefinition => !!functionDefinition)
        return functionService.getById(suggested?.id) ?? suggested ?? undefined
    }, [suggestion, functionStore])

    const target = React.useMemo(() => {
        const node = flowId && nodeId ? flowService.getNodeById(flowId, nodeId) : undefined
        return functionService.getById(node?.functionDefinition?.id)
    }, [flowStore, functionStore, flowId, nodeId])

    const TargetIcon = icon(target?.displayIcon as IconString)
    const targetParameter = target?.parameterDefinitions?.nodes?.[parameterIndex ?? -1]?.identifier
    const targetParts = (target?.displayMessages?.[0]?.content ?? FALLBACK_FUNCTION_DISPLAY_MESSAGE)
        .split(/(\$\{[^}]+\})/)
        .filter(Boolean)
        .flatMap(part => part.startsWith("${")
            ? [part.slice(2, -1)]
            : part.split(/(\s*,\s*)/)
                .filter(Boolean)
                .flatMap(text => text.trim() === "," ? [","] : text.trim() ? [text.trim()] : []))

    const [previewFits, setPreviewFits] = React.useState<{ direct?: number, result?: number }>({})

    const onDirectFit = React.useCallback((fit: number) => setPreviewFits(current =>
        current.direct === fit ? current : {...current, direct: fit}), [])

    const onResultFit = React.useCallback((fit: number) => setPreviewFits(current =>
        current.result === fit ? current : {...current, result: fit}), [])

    const measuredFits = [previewFits.direct, previewFits.result].filter((fit): fit is number => !!fit && fit > 0)
    const previewScale = measuredFits.length > 0 ? Math.min(...measuredFits) : undefined

    const FunctionIcon = icon((definition?.displayIcon ?? suggestion?.icon) as IconString)
    const name = suggestion?.displayMessage ?? definition?.names?.[0]?.content ?? "This function"
    const directValue = suggestion?.variants.find(variant => variant.__typename === "SubFlowValue")
    const resultValue = suggestion?.variants.find(variant => variant.__typename === "NodeFunction")

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent p={"0"} w={"540px"}>
                <Card color={"primary"}>
                    <Text size={"lg"} hierarchy={"primary"}>
                        {`How should ${name} be used?`}
                    </Text>
                    <Spacing spacing={"xs"}/>
                    <Text size={"md"} hierarchy={"tertiary"}>
                        Both ways work here. The difference is who decides
                        <br/>
                        what goes into it: this step, or you.
                    </Text>
                    <Spacing spacing={"xl"}/>
                    <Card style={{border: "1px solid rgba(191, 191, 191, 0.1)", boxShadow: "none"}}>
                        {directValue ? <CardSection hover border onClick={() => onVariantSelect?.(directValue)}>
                            <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
                                <div>
                                    <Text size={"md"} hierarchy={"primary"} fw={500}>Let this step use it</Text>
                                    <Spacing spacing={"xxs"}/>
                                    <Text size={"md"} hierarchy={"tertiary"}>
                                        This step handles it. Nothing to fill in.
                                    </Text>
                                </div>
                                <SuggestionVariantPreviewComponent scale={previewScale} onFitChange={onDirectFit}>
                                    <Flex align={"center"} style={{padding: "0 1.2rem 1.6rem"}}>
                                        <Card className={"d-flow-node"} color={"primary"} paddingSize={"xs"}
                                              py={"0.35"}>
                                            <Flex align={"center"} style={{gap: "0.7rem"}}>
                                                <TargetIcon color={"rgba(255,255,255,0.75)"} size={16}/>
                                                <Text size={"md"}>
                                                    {targetParts.map((part, index) => {
                                                        if (part === targetParameter) {
                                                            return <div key={index} style={{display: "inline-block"}}>
                                                                <NodeBadgeComponent definition={definition} value={{
                                                                    __typename: "SubFlowValue",
                                                                    functionDefinition: definition
                                                                }}/>
                                                            </div>
                                                        }

                                                        if (target?.parameterDefinitions?.nodes?.some(parameter => parameter?.identifier === part)) {
                                                            return <div key={index} style={{display: "inline-block"}}>
                                                                <Badge style={{verticalAlign: "middle"}} border>
                                                                    <Text size={"sm"}>{part}</Text>
                                                                </Badge>
                                                            </div>
                                                        }

                                                        return " " + String(part) + " "
                                                    })}
                                                </Text>
                                            </Flex>
                                        </Card>
                                        <div style={{
                                            width: "1.2rem",
                                            height: "3px",
                                            borderRadius: "2px",
                                            background: "linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.5))"
                                        }}/>
                                        <Flex align={"center"}
                                              style={{flexDirection: "column", gap: "0.35rem", position: "relative"}}>
                                            <Card className={"d-flow-node"} color={"primary"} paddingSize={"xs"}
                                                  display={"flex"} align={"center"} justify={"center"} miw={"50px"}
                                                  mah={"50px"} style={{aspectRatio: "50/50"}}>
                                                <Flex align={"center"}
                                                      style={{flexDirection: "column", gap: "0.35rem"}}>
                                                    <FunctionIcon color={"rgba(255,255,255,0.75)"} size={16}
                                                                  style={{width: "16px", height: "16px"}}/>
                                                </Flex>
                                            </Card>
                                            <Text size={"xs"} style={{
                                                position: "absolute",
                                                bottom: `calc(-1 * ${getSize("xxs")})`,
                                                width: "150%",
                                                left: "50%",
                                                transform: "translate(-50%, 100%)",
                                                textAlign: "center"
                                            }}>{name}</Text>
                                        </Flex>
                                    </Flex>
                                </SuggestionVariantPreviewComponent>
                            </Flex>
                        </CardSection> : null}
                        {resultValue ? <CardSection hover border onClick={() => onVariantSelect?.(resultValue)}>
                            <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
                                <div>
                                    <Text size={"md"} hierarchy={"primary"} fw={500}>Use it first, then continue</Text>
                                    <Spacing spacing={"xxs"}/>
                                    <Text size={"md"} hierarchy={"tertiary"}>
                                        Runs as its own step first. You fill it in.
                                    </Text>
                                </div>
                                <SuggestionVariantPreviewComponent scale={previewScale} onFitChange={onResultFit}>
                                    <Flex align={"center"} style={{flexDirection: "column"}}>
                                        <Card className={"d-flow-node"} color={"primary"} paddingSize={"xs"}
                                              py={"0.35"}>
                                            <Flex align={"center"} style={{gap: "0.7rem"}}>
                                                <FunctionIcon color={"rgba(255,255,255,0.75)"} size={16}/>
                                                <Text size={"md"}>{name}</Text>
                                            </Flex>
                                        </Card>
                                        <div style={{
                                            width: "3px",
                                            height: "1.2rem",
                                            borderRadius: "2px",
                                            background: "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.5))"
                                        }}/>
                                        <Card className={"d-flow-node"} color={"primary"} paddingSize={"xs"}
                                              py={"0.35"}>
                                            <Flex align={"center"} style={{gap: "0.7rem"}}>
                                                <TargetIcon color={"rgba(255,255,255,0.75)"} size={16}/>
                                                <Text size={"md"}>
                                                    {targetParts.map((part, index) => {
                                                        if (part === targetParameter) {
                                                            return <div key={index} style={{display: "inline-block"}}>
                                                                <ReferenceBadgeComponent definition={definition}
                                                                                         value={{
                                                                                             __typename: "ReferenceValue",
                                                                                             nodeFunctionId: "gid://sagittarius/NodeFunction/0"
                                                                                         }}/>
                                                            </div>
                                                        }

                                                        if (target?.parameterDefinitions?.nodes?.some(parameter => parameter?.identifier === part)) {
                                                            return <div key={index} style={{display: "inline-block"}}>
                                                                <Badge style={{verticalAlign: "middle"}} border>
                                                                    <Text size={"sm"}>{part}</Text>
                                                                </Badge>
                                                            </div>
                                                        }

                                                        return " " + String(part) + " "
                                                    })}
                                                </Text>
                                            </Flex>
                                        </Card>
                                    </Flex>
                                </SuggestionVariantPreviewComponent>
                            </Flex>
                        </CardSection> : null}
                    </Card>
                    <Spacing spacing={"xl"}/>
                    <Button color={"tertiary"} w={"100%"} justify={"center"}
                            onClick={() => onBackSelect ? onBackSelect() : onOpenChange?.(false)}>
                        {onBackSelect ? "Go back" : "Cancel"}
                    </Button>
                </Card>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
