import {Handle, Node, NodeProps, Position, useStore} from "@xyflow/react";
import React, {CSSProperties, memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {Badge, Card, Flex, Text, underlineBySeverity, useService, useStore as usePictorStore} from "@code0-tech/pictor";
import {useNodeValidation} from "@edition/flow/hooks/NodeValidation.hook";
import {IconNote, IconVariable} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {LiteralBadgeComponent} from "@edition/datatype/components/badges/LiteralBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {FunctionFileDefaultComponent} from "@edition/function/components/files/FunctionFileDefaultComponent";
import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";

export type FunctionNodeDefaultComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeDefaultComponent: React.FC<FunctionNodeDefaultComponentProps> = memo((props) => {
    const {data, id} = props

    const fileTabsService = useService(FileTabsService)
    const fileTabsStore = usePictorStore(FileTabsService)
    const flowService = useService(FlowService)
    const flowStore = usePictorStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = usePictorStore(FunctionService)

    const node = React.useMemo(() => flowService.getNodeById(data.flowId, data.nodeId), [flowStore, data])
    const definition = React.useMemo(() => node ? functionService.getById(node.functionDefinition?.id!!) : undefined, [functionStore, data, node])
    const validation = useNodeValidation(data.nodeId, data.flowId)
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
        const param = node?.parameters?.nodes?.find(p => {
            const parameterDefinition = definition?.parameterDefinitions?.find(pd => pd.id == p?.parameterDefinition?.id)
            return parameterDefinition?.identifier == item
        })

        const parameterValidation = validation?.filter(v => v.parameterId === param?.id)
        const decorationStyle: CSSProperties =
            parameterValidation?.length
                ? underlineBySeverity[parameterValidation[0].type]
                : {};

        if (param) {
            switch (param?.value?.__typename) {
                case "LiteralValue":
                    return <div style={{...decorationStyle, display: "inline-block"}}>
                        <LiteralBadgeComponent value={param.value}/>
                    </div>
                case "ReferenceValue":
                    return <div style={{...decorationStyle, display: "inline-block"}}>
                        <ReferenceBadgeComponent flowId={props.data.flowId} value={param.value}/>
                    </div>
                case "NodeFunctionIdWrapper":
                    return <div style={{...decorationStyle, display: "inline-block"}}>
                        <NodeBadgeComponent value={param.value} flowId={props.data.flowId}/>
                        <Handle
                            key={param?.id}
                            type={"target"}
                            position={Position.Right}
                            id={`param-${param?.id}`}
                            isConnectable={false}
                            className={"d-flow-node__handle d-flow-node__handle--target"}
                        />
                    </div>
            }
            return <Badge style={{verticalAlign: "middle"}} border>
                <Text size={"sm"}>
                    {item}
                </Text>
            </Badge>
        }
        return " " + String(item) + " "
    }), [flowStore, functionStore, data, definition])

    React.useEffect(() => {
        if (!node?.id || !id) return
        fileTabsService.registerTab({
            id: id,
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
            ...(isReferenced === true ? {boxShadow: `0 0 1px 0 ${data.color}`} : {}),
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
                <IconNote color={data.color} size={16}/>
                <Text size={"md"}>{displayMessage}</Text>
            </Flex>
        </Card>
    );
})
