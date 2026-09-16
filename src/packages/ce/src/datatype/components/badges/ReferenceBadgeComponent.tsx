import {Flow, FlowType, FunctionDefinition, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {NodeBadgeComponent} from "./NodeBadgeComponent";
import {IconVariable} from "@tabler/icons-react";
import {Badge, BadgeType, Flex, Text} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {useReferencedNodeIds} from "@edition/flow/hooks/Flow.references.hook";
import {useFlowReferenceHoverStore} from "@edition/flow/hooks/Flow.reference.hover.hook";

export interface ReferenceBadgeComponentProps extends Omit<BadgeType, 'value' | 'children'> {
    value: ReferenceValue
    definition?: FunctionDefinition | FlowType
}

export const ReferenceBadgeComponent: React.FC<ReferenceBadgeComponentProps> = (props) => {

    const params = useParams()
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const {value, definition, ...rest} = props

    const targetNodeId = value.nodeFunctionId || flowId
    const referencedNodeIds = useReferencedNodeIds(flowId)
    const hoveredNodeId = useFlowReferenceHoverStore(state => state.hoveredNodeId)
    const colored = referencedNodeIds.has(targetNodeId) || hoveredNodeId === targetNodeId

    const content = React.useMemo(() => {
        if (flowId) {
            return <Flex align={"center"} display={"inline-flex"}>
                <NodeBadgeComponent definition={definition} colored={colored} value={{
                    startingNodeId: value.nodeFunctionId,
                    __typename: "SubFlowValue"
                }}/>
                {"inputTypeIdentifier" in value && value.inputTypeIdentifier ? "." + value.inputTypeIdentifier : ""}
                {value.referencePath ? "." + (value.referencePath?.map(path => path.path).join(".") ?? "") : ""}
            </Flex>
        }
        return `undefined`
    }, [value, definition, colored])

    return <Badge style={{verticalAlign: "middle"}}
                  color={"warning"}
                  py={"0"}
                  border
                  {...rest}>
        <IconVariable size={12}/>
        <Text size={"sm"} style={{color: "inherit"}}>
            {content}
        </Text>
    </Badge>
}