import {Flow, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {DataTypeInputNodeBadge} from "./DataTypeInputNodeBadge";
import {IconVariable} from "@tabler/icons-react";
import {Badge, BadgeType, Flex, FlowTypeView, FunctionDefinitionView, Text} from "@code0-tech/pictor";

export interface DataTypeInputReferenceBadgeProps extends Omit<BadgeType, 'value' | 'children'> {
    value: ReferenceValue
    flowId: Flow['id']
    definition?: FunctionDefinitionView | FlowTypeView
}

export const DataTypeInputReferenceBadge: React.FC<DataTypeInputReferenceBadgeProps> = (props) => {

    const {value, flowId, definition, ...rest} = props
    const content = React.useMemo(() => {
        if (flowId) {
            return <Flex align={"center"} display={"inline-flex"}>
                <DataTypeInputNodeBadge definition={definition} value={{
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