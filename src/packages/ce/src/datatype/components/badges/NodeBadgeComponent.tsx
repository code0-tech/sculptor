import {Flow, FlowType, FunctionDefinition, NodeFunction, SubFlowValue,} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {Badge, BadgeType, hashToColor, Text, useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {useParams} from "next/navigation";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FLOW_TYPE_NAME, FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";

export interface NodeBadgeComponentProps extends Omit<BadgeType, 'value' | 'children'> {
    value: SubFlowValue
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

    const isTrigger = !value.startingNodeId && !value.functionDefinition?.identifier

    const lDefinition: FlowType | FunctionDefinition | undefined = React.useMemo(() => {
        if (isTrigger && !definition) {
            const flow = (flowService as FlowService).getById(flowId)
            return (flowTypeService as FlowTypeService).getById(flow?.type?.id)
        }

        if (value.__typename === "SubFlowValue" && !definition && value.startingNodeId) {
            const node = (flowService as FlowService).getNodeById(flowId, value.startingNodeId)
            return (functionService as FunctionService).getById(node?.functionDefinition?.id)
        }

        if (value.__typename === "SubFlowValue" && !definition && value.functionDefinition?.id) {
            return (functionService as FunctionService).getById(value.functionDefinition?.id)

        }
        return definition
    }, [flowStore, flowTypeStore])

    const name = React.useMemo(() => {
        return lDefinition?.names?.[0].content ?? (lDefinition?.__typename === "FlowType" ? FALLBACK_FLOW_TYPE_NAME : FALLBACK_FUNCTION_NAME)
    }, [functionStore, lDefinition])

    const DisplayIcon = icon(lDefinition?.displayIcon as IconString)

    return <Badge style={{verticalAlign: "middle", textWrap: "nowrap"}}
                  color={isTrigger ? "info" : hashToColor(value.startingNodeId || value.functionDefinition?.id || "")}
                  border
                  {...rest}>
        <DisplayIcon size={12}/>
        <Text size={"sm"} style={{color: "inherit"}}>
            {String(name)}
        </Text>
    </Badge>
}