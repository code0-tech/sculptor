import {Flow, FlowType, FunctionDefinition, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {NodeBadgeComponent} from "./NodeBadgeComponent";
import {IconVariable} from "@tabler/icons-react";
import {Badge, BadgeType, Flex, Text} from "@code0-tech/pictor";
import {useParams} from "next/navigation";

export interface ReferenceBadgeComponentProps extends Omit<BadgeType, 'value' | 'children'> {
    value: ReferenceValue
    definition?: FunctionDefinition | FlowType
}

export const ReferenceBadgeComponent: React.FC<ReferenceBadgeComponentProps> = (props) => {

    const params = useParams()
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const {value, definition, ...rest} = props
    const content = React.useMemo(() => {
        if (flowId) {
            return <Flex align={"center"} display={"inline-flex"}>
                <NodeBadgeComponent definition={definition} value={{
                    id: value.nodeFunctionId,
                    __typename: "NodeFunctionIdWrapper"
                }} flowId={flowId}/>
                {"inputTypeIdentifier" in value && value.inputTypeIdentifier ? "." + value.inputTypeIdentifier : ""}
                {value.referencePath ? "." + (value.referencePath?.map(path => path.path).join(".") ?? "") : ""}
            </Flex>
        }
        return `undefined`
    }, [value])

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