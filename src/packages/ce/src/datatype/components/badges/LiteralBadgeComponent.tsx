import React from "react";
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {Badge, BadgeType, Text, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger} from "@code0-tech/pictor";
import {truncateText} from "@edition/flow/components/folder/FlowFolderComponent";
import {DataTypeJSONInputTreeComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputTreeComponent";
import { EditableJSONEntry } from "../inputs/json/DataTypeJSONInputComponent";
import {Sizes} from "@code0-tech/pictor/dist/utils";

export interface LiteralBadgeComponentProps extends Omit<BadgeType, 'value' | 'children' | 'size'> {
    value: LiteralValue
    size?: Sizes
}

export const LiteralBadgeComponent: React.FC<LiteralBadgeComponentProps> = (props) => {

    const {value, size = "sm", ...rest} = props

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
                        <Text size={size}>
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
                                    <Text size={size}>
                                        {JSON.stringify(value.value)}
                                    </Text>
                                )
                            }
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            ) : (
                <Text size={size}>
                    {truncatedValue}
                </Text>
            )
        }
    </Badge>
}