import React from "react";
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {Badge, BadgeType, Text} from "@code0-tech/pictor";

export interface DataTypeInputLiteralBadgeProps extends Omit<BadgeType, 'value' | 'children'> {
    value: LiteralValue
}

export const DataTypeInputLiteralBadge: React.FC<DataTypeInputLiteralBadgeProps> = (props) => {

    const {value, ...rest} = props

    return <Badge style={{verticalAlign: "middle"}}
                  color={"secondary"}
                  {...rest}>
        <Text size={"sm"}>
            {String(value.value)}
        </Text>
    </Badge>
}