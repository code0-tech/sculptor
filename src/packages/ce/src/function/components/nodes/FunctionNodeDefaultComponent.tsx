import {Handle, Node, NodeProps, Position, useStore} from "@xyflow/react";
import React, {CSSProperties, memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {Badge, Card, Flex, Text, useService, useStore as usePictorStore} from "@code0-tech/pictor";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {IconNote, IconVariable} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {LiteralBadgeComponent} from "@edition/datatype/components/badges/LiteralBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {FunctionFileDefaultComponent} from "@edition/function/components/files/FunctionFileDefaultComponent";
import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {underlineBySeverity} from "@core/util/inspection";
import {icon, IconString} from "@core/util/icons";

export type FunctionNodeDefaultComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeDefaultComponent: React.FC<FunctionNodeDefaultComponentProps> = memo((props) => {
    const {data, id} = props

    const fileTabsService = useService(FileTabsService)
    const fileTabsStore = usePictorStore(FileTabsService)
    const flowService = useService(FlowService)
    const flowStore = usePictorStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = usePictorStore(FunctionService)

    const node = React.useMemo(
        () => flowService.getNodeById(data.flowId, data.nodeId),
        [flowStore, data]
    )
    const definition = React.useMemo(
        () => node ? functionService.getById(node.functionDefinition?.id!!) : undefined,
        [functionStore, data, node]
    )

    const validation = useFlowValidation(data.flowId)

    const activeTabId = React.useMemo(() => {
        return fileTabsService.getActiveTab()?.id
    }, [fileTabsStore, fileTabsService]);

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

    const displayMessage = React.useMemo(() => splitTemplate(definition?.displayMessages!![0]?.content ?? "").map(item => {
        const nodeParameter = node?.parameters?.nodes?.find(p => {
            const parameterDefinition = definition?.parameterDefinitions?.nodes?.find(pd => pd?.id == p?.parameterDefinition?.id)
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
                        <LiteralBadgeComponent value={nodeParameter.value}/>
                    </div>
                case "ReferenceValue":
                    return <div style={{...decorationStyle, display: "inline-block"}}>
                        <ReferenceBadgeComponent value={nodeParameter.value}/>
                    </div>
                case "NodeFunctionIdWrapper":
                    return <div style={{...decorationStyle, display: "inline-block"}}>
                        <NodeBadgeComponent value={nodeParameter.value}/>
                        <Handle
                            key={parameterIndex}
                            type={"target"}
                            position={Position.Right}
                            id={`param-${parameterIndex}`}
                            isConnectable={false}
                            className={"d-flow-node__handle d-flow-node__handle--target"}
                        />
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

    React.useEffect(() => {
        if (!node?.id) return
        fileTabsService.registerTab({
            id: node.id,
            active: false,
            closeable: true,
            children: <>
                <IconNote color={data.color} size={12}/>
                <Text size={"sm"}>{definition?.names!![0]?.content}</Text>
            </>,
            content: <FunctionFileDefaultComponent flowId={props.data.flowId} node={node}/>
        })
    }, [])

    const isReferenced = React.useMemo(() => {

        const activeNode = flowService.getNodeById(data.flowId, activeTabId as NodeFunction['id'])
        const isActiveNodeReferencingCurrentNode = activeNode?.parameters?.nodes?.some(p => p?.value?.__typename === "ReferenceValue" && p.value.nodeFunctionId === node?.id)
        const hasReferences = activeNode?.parameters?.nodes?.some(p => p?.value?.__typename === "ReferenceValue")

        if (isActiveNodeReferencingCurrentNode) {
            return true
        } else if (hasReferences && !isActiveNodeReferencingCurrentNode && activeTabId !== data.nodeId) {
            return false
        }

        return undefined

    }, [flowStore, activeTabId, data.flowId, node])

    const DisplayIcon = icon(definition?.displayIcon as IconString)

    return (
        <Card
            key={id}
            data-flow-refernce={id}
            paddingSize={"xs"}
            py={"0.35"}
            outline={firstItem.id === id}
            borderColor={activeTabId == id ? "info" : undefined}
            className={`d-flow-node ${activeTabId == id ? "d-flow-node--active" : ""} ${isReferenced === false ? "d-flow-node--notReferenced" : ""}`}
            color={"primary"} style={{
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


            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <DisplayIcon color={data.color} size={16}/>
                <Text size={"md"}>{displayMessage}</Text>
            </Flex>
        </Card>
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

const mixColorRgb = (color: string, level: number) => {
    const w = clamp01(level * 0.1)

    const c1 = parseCssColorToRgba(color)
    const c2 = parseCssColorToRgba("#070514")

    const mix = (a: number, b: number) =>
        Math.round(a * (1 - w) + b * w)

    return `rgb(${mix(c1.r, c2.r)}, ${mix(c1.g, c2.g)}, ${mix(c1.b, c2.b)})`
}

const withAlpha = (color: string, alpha: number) => {
    const c = parseCssColorToRgba(color)
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${clamp01(alpha)})`
}
