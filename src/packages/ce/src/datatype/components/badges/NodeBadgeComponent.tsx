import {
    Flow,
    FlowType,
    FunctionDefinition,
    NodeFunction,
    NodeFunctionIdWrapper
} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {Badge, BadgeType, hashToColor, Text, useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {useParams} from "next/navigation";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FLOW_TYPE_NAME, FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";

export interface NodeBadgeComponentProps extends Omit<BadgeType, 'value' | 'children'> {
    value: NodeFunction | NodeFunctionIdWrapper
    definition?: FunctionDefinition | FlowType
}

export const NodeBadgeComponent: React.FC<NodeBadgeComponentProps> = (props) => {

    const params = useParams()
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const {value, definition, ...rest} = props

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
            return definition.names?.[0]?.content ?? (definition.__typename === "FunctionDefinition" ? FALLBACK_FUNCTION_NAME : FALLBACK_FLOW_TYPE_NAME)
        } else if (isTrigger && node?.__typename === "FlowType") {
            return node.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_NAME
        }
        return (functionService as FunctionService).getById((node as NodeFunction)?.functionDefinition?.id)?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME
    }, [functionStore, node])

    const lDefinition = React.useMemo(
        () => {
            if (definition) {
                return definition
            } else if (isTrigger && node?.__typename === "FlowType") {
                return node
            }
            return (functionService as FunctionService).getById((node as NodeFunction)?.functionDefinition?.id)
        },
        [functionStore, node]
    )

    const DisplayIcon = icon(lDefinition?.displayIcon as IconString)

    return <Badge style={{verticalAlign: "middle", textWrap: "nowrap"}}
                  color={isTrigger ? "info" : hashToColor(value.id || "")}
                  border
                  {...rest}>
        <DisplayIcon size={12}/>
        <Text size={"sm"} style={{color: "inherit"}}>
            {String(name)}
        </Text>
    </Badge>
}