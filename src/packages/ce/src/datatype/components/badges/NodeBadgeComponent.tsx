import {
    Flow,
    FlowType,
    FunctionDefinition,
    NodeFunction,
    NodeFunctionIdWrapper
} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {IconBolt, IconNote} from "@tabler/icons-react";
import {
    Badge,
    BadgeType,
    hashToColor, Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";

export interface NodeBadgeComponentProps extends Omit<BadgeType, 'value' | 'children'> {
    value: NodeFunction | NodeFunctionIdWrapper
    flowId: Flow['id']
    definition?: FunctionDefinition | FlowType
}

export const NodeBadgeComponent: React.FC<NodeBadgeComponentProps> = (props) => {

    const {value, flowId, definition, ...rest} = props

    const functionService = definition || useService(FunctionService)
    const functionStore = definition || useStore(FunctionService)
    const flowService = definition || useService(FlowService)
    const flowStore = definition || useStore(FlowService)
    const flowTypeService = definition || useService(FlowTypeService)
    const flowTypeStore = definition || useStore(FlowTypeService)

    const isTrigger = value.__typename === "NodeFunctionIdWrapper" && !value.id

    const node: NodeFunction | FlowType | NodeFunctionIdWrapper | undefined = React.useMemo(() => {
        if (isTrigger && !definition) {
            const flow = (flowService as FlowService).getById(flowId)
            return (flowTypeService as FlowTypeService).getById(flow?.type?.id)
        }
        return value.__typename === "NodeFunction" || definition ? value : (flowService as FlowService).getNodeById(flowId, value.id)
    }, [flowStore, flowTypeStore])

    const name = React.useMemo(() => {
        if (definition) {
            return definition.names?.[0]?.content
        } else if (isTrigger && node?.__typename === "FlowType") {
            return node.names?.[0]?.content
        }
        return (functionService as FunctionService).getById((node as NodeFunction)?.functionDefinition?.id)?.names?.[0]?.content
    }, [functionStore, node])

    return <Badge style={{verticalAlign: "middle", textWrap: "nowrap"}}
                  color={isTrigger ? "info" : hashToColor(value.id || "")}
                  border
                  {...rest}>
        {
            isTrigger
            ? <IconBolt size={12}/>
            : <IconNote size={12}/>
        }
        <Text size={"sm"} style={{color: "inherit"}}>
            {String(name)}
        </Text>
    </Badge>
}