import {Handle, Node, NodeProps, Position, useStore} from "@xyflow/react";
import React, {CSSProperties, memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {Badge, Card, Flex, getSize, Text, useService, useStore as usePictorStore} from "@code0-tech/pictor";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {IconVariable} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {underlineBySeverity} from "@core/util/inspection";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FUNCTION_DISPLAY_MESSAGE, FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";
import {useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";
import {useReferencedNodeIds} from "@edition/flow/hooks/Flow.references.hook";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";
import {LiteralBadgeComponent} from "@edition/datatype/components/badges/LiteralBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";

export type FunctionNodeSquareComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeSquareComponent: React.FC<FunctionNodeSquareComponentProps> = memo((props) => {
    const {data, id, selected} = props

    const flowService = useService(FlowService)
    const flowStore = usePictorStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = usePictorStore(FunctionService)

    const node = React.useMemo(
        () => flowService.getNodeById(data.flowId, data.nodeId),
        [flowStore, data]
    )

    const selectedNode = useSelectedFunctionNode()

    const definition = React.useMemo(
        () => functionService.getById(node?.functionDefinition?.id || data.functionId),
        [functionStore, data, node]
    )

    const DisplayIcon = icon(definition?.displayIcon as IconString)

    const referencedNodeIds = useReferencedNodeIds(data.flowId)
    const hoveredNodeId = useFlowReferenceHoverStore(state => state.hoveredNodeId)
    const iconColor = referencedNodeIds.has(id) || hoveredNodeId === id ? data.color : "rgba(255,255,255,0.75)"

    const validation = useFlowValidation(data.flowId)

    const nodeValidations = React.useMemo(
        () => validation?.filter(v => v.nodeId === data.nodeId && !data.functionId),
        [validation]
    )

    const nodeValidationStyle: CSSProperties =
        nodeValidations?.length
            ? underlineBySeverity[nodeValidations[0].type]
            : {};

    const firstItem = useStore((s) => {
        const children = s.nodes.filter((n) => n.parentId === props.parentId);
        let start: any | undefined = undefined;
        children.forEach((n) => {
            const idx = (n.data as any)?.index ?? Infinity;
            const startIdx = (start?.data as any)?.index ?? Infinity;
            if (!start || idx < startIdx) {
                start = n;
            }
        });
        return start;
    })

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
            );

    const displayMessage = React.useMemo(() => splitTemplate(definition?.displayMessages?.[0]?.content ?? FALLBACK_FUNCTION_DISPLAY_MESSAGE).map(item => {
        const nodeParameter = node?.parameters?.nodes?.find((_, index) => {
            const parameterDefinition = definition?.parameterDefinitions?.nodes?.[index]
            return parameterDefinition?.identifier == item
        })

        const parameterDefinition = definition?.parameterDefinitions?.nodes?.find(pd => pd?.identifier == item)
        const parameterIndex = parameterDefinition ? definition?.parameterDefinitions?.nodes?.findIndex(p => p?.id === parameterDefinition.id) : undefined
        const parameterValidation = validation?.filter(v => v.parameterIndex === parameterIndex && v.nodeId === node?.id)
        const decorationStyle: CSSProperties =
            parameterValidation?.length
                ? underlineBySeverity[parameterValidation[0].type]
                : {};

        if (parameterDefinition) {
            switch (nodeParameter?.value?.__typename) {
                case "LiteralValue":
                    return <div style={{...decorationStyle, display: "inline-block"}}>
                        <LiteralBadgeComponent value={nodeParameter.value}
                                               size={"xs"}
                                               schema={data.schema?.[parameterIndex!]?.schema}/>
                    </div>
                case "ReferenceValue":
                    return <div style={{...decorationStyle, display: "inline-block"}}>
                        <ReferenceBadgeComponent value={nodeParameter.value}/>
                    </div>
                case "SubFlowValue":
                    return <div style={{...decorationStyle, display: "inline-block"}}>
                        <NodeBadgeComponent value={nodeParameter.value}/>
                    </div>
            }
            return <div style={{...decorationStyle, display: "inline-block"}}>
                <Badge style={{verticalAlign: "middle"}} border>
                    <Text size={"sm"}>
                        {item}
                    </Text>
                </Badge>
            </div>
        }
        return " " + String(item) + " "
    }), [flowStore, functionStore, data, definition, validation])

    const isReferenced = React.useMemo(() => {

        const activeNode = flowService.getNodeById(data.flowId, selectedNode?.id as NodeFunction['id'])
        const isActiveNodeReferencingCurrentNode = activeNode?.parameters?.nodes?.some(p => p?.value?.__typename === "ReferenceValue" && p.value.nodeFunctionId === node?.id)
        const hasReferences = activeNode?.parameters?.nodes?.some(p => p?.value?.__typename === "ReferenceValue")

        if (isActiveNodeReferencingCurrentNode) {
            return true
        } else if (hasReferences && !isActiveNodeReferencingCurrentNode && selectedNode?.id !== data.nodeId) {
            return false
        }

        return undefined

    }, [flowStore, selectedNode, data.flowId, node])

    return (
        <Flex align={"center"} style={{flexDirection: "column", gap: "0.35rem"}}>
            <Card
                data-qa-selector={"flow-builder-node"}
                key={id}
                data-flow-refernce={id}
                paddingSize={"xs"}
                display={"flex"}
                align={"center"}
                justify={"center"}
                miw={"50px"}
                mah={"50px"}
                outline={firstItem.id === id}
                borderColor={selectedNode?.id == id ? "info" : undefined}
                className={`d-flow-node ${selectedNode?.id == id ? "d-flow-node--active" : ""} ${isReferenced === false ? "d-flow-node--notReferenced" : ""}`}
                color={"primary"} style={{
                    aspectRatio: "50/50",
                ...(isReferenced === true || hoveredNodeId === id ? {boxShadow: `0 0 5rem 0 ${withAlpha(data.color, 0.25)}`} : {}),
            }}>

                <Handle
                    isConnectable={false}
                    draggable={false}
                    type="target"
                    className={"d-flow-node__handle d-flow-node__handle--target"}
                    style={{...(data.isParameter ? {right: "2px"} : {top: "2px"})}}
                    position={data.isParameter ? Position.Right : Position.Top}
                />

                <Handle
                    type={"target"}
                    position={Position.Right}
                    id={`param`}
                    isConnectable={false}
                    className={"d-flow-node__handle d-flow-node__handle--target"}
                />

                {/* Ausgang */}
                <Handle
                    isConnectable={false}
                    type="source"
                    style={{...(data.isParameter ? {left: "2px"} : {bottom: "2px"})}}
                    className={"d-flow-node__handle d-flow-node__handle--source"}
                    position={data.isParameter ? Position.Left : Position.Bottom}
                />

                {
                    isReferenced === true || hoveredNodeId === id ? (
                        <div className={"d-flow-node__isReferenced"} style={{
                            position: "absolute",
                            top: "50%",
                            left: firstItem.id === id ? "-0.733rem" : "-0.5rem",
                            transform: "translate(-100%, -50%)",
                            display: "flex"
                        }}>
                            <IconVariable className={"d-flow-node__isReferenced-icon"} color={data.color} size={13}/>
                        </div>
                    ) : null
                }


                <Flex align={"center"} style={{flexDirection: "column", gap: "0.35rem", ...nodeValidationStyle}}>
                    <DisplayIcon color={iconColor} size={16} style={{width: "16px", height: "16px"}}/>
                </Flex>
            </Card>
            <Text size={"sm"} style={{
                position: "absolute",
                bottom: `calc(-1 * ${getSize("xxs")})`,
                width: "150%",
                left: "50%",
                transform: "translate(-50%, 100%)",
                textAlign: "center"
            }}>
                {node ? displayMessage : definition?.names?.[0].content ?? FALLBACK_FUNCTION_NAME}
            </Text>
        </Flex>
    );
})

type RGBA = {
    r: number
    g: number
    b: number
    a: number
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

const parseCssColorToRgba = (color: string): RGBA => {
    if (typeof document === "undefined") {
        return {r: 0, g: 0, b: 0, a: 1}
    }

    const el = document.createElement("span")
    el.style.color = color
    document.body.appendChild(el)

    const computed = getComputedStyle(el).color
    document.body.removeChild(el)

    const match = computed.match(
        /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/
    )

    if (!match) {
        return {r: 0, g: 0, b: 0, a: 1}
    }

    return {
        r: Math.round(Number(match[1])),
        g: Math.round(Number(match[2])),
        b: Math.round(Number(match[3])),
        a: match[4] !== undefined ? Number(match[4]) : 1,
    }
}

const withAlpha = (color: string, alpha: number) => {
    const c = parseCssColorToRgba(color)
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${clamp01(alpha)})`
}
