import React from "react";
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {Badge, BadgeType, Text} from "@code0-tech/pictor";

export interface LiteralBadgeComponentProps extends Omit<BadgeType, 'value' | 'children'> {
    value: LiteralValue
}

export const LiteralBadgeComponent: React.FC<LiteralBadgeComponentProps> = (props) => {

    const {value, ...rest} = props

    return <Badge style={{verticalAlign: "middle"}}
                  color={"secondary"}
                  {...rest}>
        <Text size={"sm"} style={{
            maxWidth: "50px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        }}>
            {JSON.stringify(value.value)}
        </Text>
    </Badge>
}