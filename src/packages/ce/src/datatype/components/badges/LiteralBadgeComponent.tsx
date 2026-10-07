import React from "react";
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {Badge, BadgeType, Text} from "@code0-tech/pictor";
import {truncateText} from "@edition/flow/components/folder/FlowFolderComponent";
import {Sizes} from "@code0-tech/pictor/dist/utils";
import {Schema} from "@code0-tech/triangulum";
import {IconCalendar} from "@tabler/icons-react";

export interface LiteralBadgeComponentProps extends Omit<BadgeType, 'value' | 'children' | 'size'> {
    value: LiteralValue
    size?: Sizes
    schema?: Schema
}

export const LiteralBadgeComponent: React.FC<LiteralBadgeComponentProps> = (props) => {

    const {value, size = "sm", schema, ...rest} = props

    const content = React.useMemo(() => {
        const literal = value?.value as any

        if (typeof literal?.hue === "number" && typeof literal?.saturation === "number" && typeof literal?.lightness === "number") {
            const color = `hsla(${literal.hue}, ${literal.saturation}%, ${literal.lightness}%, ${literal.alpha ?? 1})`
            return <>
                <div style={{
                    background: color,
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    flex: "0 0 auto"
                }}/>
                <Text size={size}>
                    {color}
                </Text>
            </>
        }

        if (schema?.input === "date" && typeof literal === "number") {
            return <>
                <IconCalendar size={12}/>
                <Text size={size}>
                    {new Intl.DateTimeFormat("de-DE", {
                        timeZone: "UTC",
                        dateStyle: "medium",
                        timeStyle: "medium"
                    }).format(new Date(literal * 1000))}
                </Text>
            </>
        }

        return <Text size={size}>
            {truncateText(JSON.stringify(literal), 75)}
        </Text>
    }, [value, schema?.input, size])

    return <Badge style={{verticalAlign: "middle"}}
                  color={"secondary"}
                  {...rest}>
        {content}
    </Badge>
}
