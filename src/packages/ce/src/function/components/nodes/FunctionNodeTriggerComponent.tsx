import React, {CSSProperties, memo} from "react";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {Badge, Card, Flex, Text, useService, useStore as usePictorStore} from "@code0-tech/pictor";
import {FunctionNodeComponentProps} from "@edition/function/components/nodes/FunctionNodeComponent";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {IconVariable} from "@tabler/icons-react";
import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FLOW_TYPE_DISPLAY_MESSAGE, FALLBACK_FLOW_TYPE_NAME} from "@core/util/fallback-translations";
import {useFlowValidation} from "@edition/flow/hooks/Flow.validation.hook";
import {underlineBySeverity} from "@core/util/inspection";
import {useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";
import {LiteralBadgeComponent} from "@edition/datatype/components/badges/LiteralBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";


export type FunctionNodeTriggerComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeTriggerComponent: React.FC<FunctionNodeTriggerComponentProps> = memo((props) => {

    const {data, id, selected} = props
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = usePictorStore(FlowTypeService)
    const flowService = useService(FlowService)
    const flowStore = usePictorStore(FlowService)

    const flow = React.useMemo(() => flowService.getById(data.flowId), [flowStore, data])
    const definition = React.useMemo(() => flow ? flowTypeService.getById(flow.type?.id) : undefined, [flowTypeStore, flow])
    const DisplayIcon = icon(definition?.displayIcon as IconString)
    const validation = useFlowValidation(data.flowId)

    const triggerValidations = React.useMemo(
        () => validation?.filter(v => v.nodeId === null && v.parameterIndex === null),
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

    const displayMessage = React.useMemo(() => splitTemplate(definition?.displayMessages?.[0]?.content ?? FALLBACK_FLOW_TYPE_DISPLAY_MESSAGE).map(item => {

        const nodeParameter = flow?.settings?.nodes?.find((_, index) => {
            const parameterDefinition = definition?.flowTypeSettings?.[index]
            return parameterDefinition?.identifier == item
        })

        const parameterDefinition = definition?.flowTypeSettings?.find(pd => pd?.identifier == item)
        const parameterIndex = parameterDefinition ? definition?.flowTypeSettings?.findIndex(p => p?.id === parameterDefinition.id) : undefined
        const parameterValidation = validation?.filter(v => v.parameterIndex === parameterIndex && !v.nodeId)
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
    }), [flowStore, data, definition, validation])

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

    return <Card data-qa-selector={"flow-builder-trigger"}
                 variant={"normal"}
                 color={"info"}
                 paddingSize={"xs"}
                 key={id}
                 data-flow-refernce={id}
                 className={`d-flow-node ${selected ? "d-flow-node--active" : undefined}`}
                 style={{...(isReferenced === true ? {boxShadow: `0 0 5rem 0 rgba(112, 255, 178, 0.25)`} : {}),}}>

        <Badge color={"info"}
               pos={"absolute"}
               top={"-0.35rem"}
               left={"50%"}
               style={{transform: "translate(-50%, -100%)"}}>
            Starting node
        </Badge>

        <Flex style={{gap: "0.7rem", ...triggerValidationStyle}} align={"center"}>
            <DisplayIcon color={data.color} size={16}/>
            <Text size={"md"}>{flow ? displayMessage : definition?.names?.[0].content ?? FALLBACK_FLOW_TYPE_NAME}</Text>
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
    </Card>


})