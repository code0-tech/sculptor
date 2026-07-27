import React, {CSSProperties, memo} from "react";
import {Handle, Node, NodeProps, NodeToolbar, Position} from "@xyflow/react";
import {
    Button,
    ButtonGroup,
    Card,
    Flex,
    Text,
    useService,
    useStore,
    useStore as usePictorStore
} from "@code0-tech/pictor";
import {FunctionNodeComponentProps} from "@edition/function/components/nodes/FunctionNodeComponent";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {IconPencil, IconSparkles, IconVariable} from "@tabler/icons-react";
import {Namespace, NamespaceProject, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FLOW_TYPE_DISPLAY_MESSAGE, FALLBACK_FLOW_TYPE_NAME} from "@core/util/fallback-translations";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {underlineBySeverity} from "@core/util/inspection";
import {useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";
import {LiteralBadgeComponent} from "@edition/datatype/components/badges/LiteralBadgeComponent";
import {useParams} from "next/navigation";
import {ProjectService} from "@edition/project/services/Project.service";
import {ModuleService} from "@edition/module/services/Module.service";


export type FunctionNodeTriggerComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeTriggerComponent: React.FC<FunctionNodeTriggerComponentProps> = memo((props) => {

    const {data, id, selected} = props

    const params = useParams()
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = usePictorStore(FlowTypeService)
    const flowService = useService(FlowService)
    const flowStore = usePictorStore(FlowService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const flow = React.useMemo(
        () => flowService.getById(data.flowId, {
            namespaceId,
            projectId
        }),
        [data.flowId, namespaceId, projectId, flowStore]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId, {
            namespaceId
        }),
        [projectId, namespaceId, projectStore]
    )

    const flowType = React.useMemo(
        () => flowTypeService.getById(flow?.type?.id, {
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flow?.type?.id, namespaceId, projectId, project?.primaryRuntime?.id, flowTypeStore]
    )

    const module = React.useMemo(
        () => moduleService.getById(flowType?.runtimeModule?.id, {
            namespaceId: namespaceId,
            projectId: projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flowType?.runtimeModule?.id, namespaceId, projectId, project?.primaryRuntime?.id, moduleStore]
    )

    let endpoint = `http://${module?.definitions?.nodes?.[0]?.host}:${module?.definitions?.nodes?.[0]?.port}${module?.definitions?.nodes?.[0]?.endpoint}`
        .replace("${{project_slug}}", project?.slug ?? "${{project_slug}}")

    flow?.settings?.nodes?.forEach(setting => {
        endpoint = endpoint.replace(`\${{${setting?.flowSettingIdentifier}}}`, setting?.value)
    })

    const DisplayIcon = icon(flowType?.displayIcon as IconString)
    const validation = useFlowValidation(data.flowId)

    const triggerValidations = React.useMemo(
        () => validation?.filter(v => v.nodeId === null),
        [validation]
    )

    const triggerValidationStyle: CSSProperties =
        triggerValidations?.length
            ? underlineBySeverity[triggerValidations[0].type]
            : {};

    const selectedNode = useSelectedFunctionNode()

    const splitTemplate = (str: string) =>
        str
            .split(/(\$\{[^}]+\})/)
            .filter(Boolean)
            .flatMap(part =>
                part.startsWith("${")
                    ? [part.slice(2, -1)]          // variable name ohne ${}
                    : part.split(/(\s*,\s*)/)      // Kommas einzeln extrahieren
                        .filter(Boolean)
                        .flatMap(p => p.trim() === "," ? [","] : p.trim() ? [p.trim()] : [])
            )

    const displayMessage = React.useMemo(() => splitTemplate(flowType?.displayMessages?.[0]?.content ?? FALLBACK_FLOW_TYPE_DISPLAY_MESSAGE).map(item => {

        const nodeParameter = flow?.settings?.nodes?.find((_, index) => {
            const parameterDefinition = flowType?.flowTypeSettings?.nodes?.[index]
            return parameterDefinition?.identifier == item
        })

        const parameterDefinition = flowType?.flowTypeSettings?.nodes?.find(pd => pd?.identifier == item)
        const parameterIndex = parameterDefinition ? flowType?.flowTypeSettings?.nodes?.findIndex(p => p?.id === parameterDefinition.id) : undefined
        const parameterValidation = validation?.filter(v => v.parameterIndex === parameterIndex && !v.nodeId)
        const decorationStyle: CSSProperties =
            parameterValidation?.length
                ? underlineBySeverity[parameterValidation[0].type]
                : {};

        if (parameterDefinition) {
            return <div style={{...decorationStyle, display: "inline-block"}}>
                <LiteralBadgeComponent size={"xs"} value={{
                    __typename: "LiteralValue",
                    value: nodeParameter?.value
                }}/>
            </div>
        }
        return " " + String(item) + " "
    }), [flowStore, data, flowType, validation])

    const isReferenced = React.useMemo(() => {

        const activeNode = flowService.getNodeById(data.flowId, selectedNode?.id as NodeFunction['id'])
        const isActiveNodeReferencingCurrentNode = activeNode?.parameters?.nodes?.some(p => p?.value?.__typename === "ReferenceValue" && !p.value.nodeFunctionId)
        const hasReferences = activeNode?.parameters?.nodes?.some(p => p?.value?.__typename === "ReferenceValue")

        if (isActiveNodeReferencingCurrentNode) {
            return true
        } else if (hasReferences && !isActiveNodeReferencingCurrentNode && selectedNode?.id !== data.nodeId) {
            return false
        }

        return undefined

    }, [flowStore, selectedNode, data.flowId])

    return (
        <Flex align={"center"} style={{flexDirection: "column", gap: "0.7rem"}}>
            <Card
                data-qa-selector={"flow-builder-trigger"}
                variant={"normal"}
                color={"secondary"}
                paddingSize={"xs"}
                display={"flex"}
                align={"center"}
                justify={"center"}
                key={id}
                data-flow-refernce={id}
                miw={"60px"}
                mah={"60px"}
                className={`d-flow-node ${selected ? "d-flow-node--active" : undefined}`}
                style={{
                    transform: "rotate(45deg)",
                    aspectRatio: "50/50",
                    ...(isReferenced === true ? {
                        boxShadow: `0 0 5rem 0 rgba(112, 255, 178, 0.25)`,
                    } : {}),
                }}>

                <NodeToolbar align={"center"} offset={16} position={Position.Top}>
                    <ButtonGroup color={"secondary"}>
                        <Button variant={"none"} color={"tertiary"} paddingSize={"xxs"} onClick={(e) => {
                            const event = new KeyboardEvent('keydown', {
                                key: '1',
                                code: 'Key1',
                                shiftKey: true,
                                bubbles: true,
                                cancelable: true,
                            });

                            document.dispatchEvent(event);
                            e.stopPropagation();
                            e.preventDefault();
                        }}>
                            <IconPencil size={13}/>
                        </Button>
                        <Button variant={"none"} color={"tertiary"} paddingSize={"xxs"} onClick={(e) => {
                            const event = new KeyboardEvent('keydown', {
                                key: 'Q',
                                code: 'KeyQ',
                                shiftKey: true,
                                bubbles: true,
                                cancelable: true,
                            });

                            document.dispatchEvent(event);
                            e.stopPropagation();
                            e.preventDefault();
                        }}>
                            <IconSparkles size={13}/>
                            <Text size={"xs"}>Edit with AI</Text>
                        </Button>
                    </ButtonGroup>
                </NodeToolbar>

                <div style={{
                    transform: "rotate(-45deg)",
                }}>

                    <Flex align={"center"} style={{flexDirection: "column", gap: "0.35rem", ...triggerValidationStyle}}>
                        <DisplayIcon color={data.color} size={16} style={{width: "16px", height: "16px"}}/>
                    </Flex>

                    {
                        isReferenced === true ? (
                            <div className={"d-flow-node__isReferenced"} style={{
                                position: "absolute",
                                top: "50%",
                                left: "-0.5rem",
                                transform: "translate(-100%, -50%)",
                                display: "flex"
                            }}>
                                <IconVariable className={"d-flow-node__isReferenced-icon"} color={"#70ffb2"} size={13}/>
                            </div>
                        ) : null
                    }

                    <Handle
                        isConnectable={false}
                        type="source"
                        style={{bottom: "2px"}}
                        className={"d-flow-node__handle d-flow-node__handle--source"}
                        position={Position.Bottom}
                    />
                </div>
            </Card>
            <Text size={"xs"} w={"200px"} style={{textAlign: "center"}}>
                {flow ? displayMessage : flowType?.names?.[0].content ?? FALLBACK_FLOW_TYPE_NAME}
            </Text>
        </Flex>
    )


})