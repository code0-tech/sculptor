import {Handle, Node, NodeProps, Position, useStore} from "@xyflow/react";
import React, {CSSProperties, memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {Card, Flex, Text, useService, useStore as usePictorStore} from "@code0-tech/pictor";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {IconVariable} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {underlineBySeverity} from "@core/util/inspection";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";
import {useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";

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
                ...(isReferenced === true ? {boxShadow: `0 0 5rem 0 ${withAlpha(data.color, 0.25)}`} : {}),
            }}>

                <Handle
                    isConnectable={false}
                    draggable={false}
                    type="target"
                    className={"d-flow-node__handle d-flow-node__handle--target"}
                    style={{...(data.isParameter ? {right: "2px"} : {top: "2px"})}}
                    position={data.isParameter ? Position.Right : Position.Top}
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
                    isReferenced === true ? (
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
                    <DisplayIcon color={data.color} size={16} style={{width: "16px", height: "16px"}}/>
                </Flex>
            </Card>
            <Text size={"xs"}>{definition?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME}</Text>
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
