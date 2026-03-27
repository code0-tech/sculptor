import React from "react";
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {Badge, BadgeType, Text, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger} from "@code0-tech/pictor";
import {truncateText} from "@edition/flow/components/folder/FlowFolderComponent";
import {DataTypeJSONInputTreeComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputTreeComponent";
import { EditableJSONEntry } from "../inputs/json/DataTypeJSONInputComponent";

export interface LiteralBadgeComponentProps extends Omit<BadgeType, 'value' | 'children'> {
    value: LiteralValue
}

export const LiteralBadgeComponent: React.FC<LiteralBadgeComponentProps> = (props) => {

    const {value, ...rest} = props

    const truncatedValue = React.useMemo(() => {
        return truncateText(JSON.stringify(value.value), 75)
    }, [value])

    return <Badge style={{verticalAlign: "middle"}}
                  color={"secondary"}
                  {...rest}>
        {
            !JSON.stringify(value).includes(truncatedValue) ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Text size={"sm"}>
                            {truncatedValue}
                        </Text>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent sideOffset={8} color={ Array.isArray(value.value) || typeof value.value === "object" ? "primary" : "secondary"}>
                            {
                                Array.isArray(value.value) || typeof value.value === "object" ? (
                                    <DataTypeJSONInputTreeComponent object={value}
                                                                    onEntryClick={function (entry: EditableJSONEntry): void {

                                                                    }} collapsedState={{}}
                                                                    setCollapsedState={function (path: string[], collapsed: boolean): void {
                                                                    }}/>
                                ) : (
                                    <Text size={"sm"}>
                                        {JSON.stringify(value.value)}
                                    </Text>
                                )
                            }
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            ) : (
                <Text size={"sm"}>
                    {truncatedValue}
                </Text>
            )
        }
    </Badge>
}