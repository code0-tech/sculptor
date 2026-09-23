"use client"

import React from "react";
import {
    Button,
    Flex,
    getSize,
    ProgressCircle,
    ProgressLinear,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";
import {getUsageColor, getUsageFill, USAGE_NEUTRAL_COLOR} from "@core/util/usage";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {UpgradeButtonComponent} from "@edition/license/components/UpgradeButtonComponent";

const numberFormat = new Intl.NumberFormat()

export interface UsageIndicatorComponentProps {
    metric?: "workflow" | "ai"
    side?: React.ComponentProps<typeof TooltipContent>["side"]
    align?: React.ComponentProps<typeof TooltipContent>["align"]
    paddingSize?: React.ComponentProps<typeof Button>["paddingSize"]
}

export const UsageIndicatorComponent: React.FC<UsageIndicatorComponentProps> = (props) => {

    const {metric, side = "left", align, paddingSize = "xs"} = props

    const {accessible, limits, namespaceIndex, contextLabel, overallUsage, contextUsage} = useUsageOverview()
    const [tooltipOpen, setTooltipOpen] = React.useState(false)
    const hasContext = !!contextUsage

    if (!accessible) return null

    const sections = [
        {metric: "workflow", title: "Workflow usage", overall: overallUsage?.runtimeCount ?? 0, context: contextUsage?.runtimeCount ?? 0, limit: limits.workflow},
        {metric: "ai", title: "AI usage", overall: overallUsage?.aiValue ?? 0, context: contextUsage?.aiValue ?? 0, limit: limits.ai}
    ].filter(section => !metric || section.metric === metric).map(section => {

        const bounded = section.limit != null && section.limit > 0

        return {
            ...section,
            bounded,
            free: bounded ? Math.max(0, section.limit! - section.overall) : 0,
            overallFill: getUsageFill(section.overall, section.limit),
            contextFill: section.limit == null
                ? (section.overall > 0 ? Math.min(100, Math.round((section.context / section.overall) * 100)) : 0)
                : getUsageFill(section.context, section.limit),
            color: getUsageColor(section.overall, section.limit)
        }
    })

    return <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
            <Button variant={"none"} style={{padding: getSize("xs")}}>
                <Flex w={"16px"} h={"16px"} align={"center"} justify={"center"}>
                    {sections.map((section, index) => (
                        <ProgressCircle key={section.title}
                                        style={index < sections.length - 1 ? {position: "absolute"} : undefined}
                                        value={section.overallFill}
                                        color={section.color}
                                        size={16 - (index * 6)}/>
                    ))}
                </Flex>
            </Button>
        </TooltipTrigger>
        <TooltipPortal>
            <TooltipContent color={"primary"} side={side} align={align} sideOffset={8}
                            style={{zIndex: 49}}
                            onClick={() => setTooltipOpen(false)}>
                <Flex style={{flexDirection: "column", gap: getSize("md"), minWidth: "220px"}}>
                    {sections.map((section, index) => {

                        const legend = [
                            hasContext && {label: contextLabel, value: section.context, opacity: 1},
                            {label: "Overall", value: section.overall, opacity: hasContext ? 0.35 : 1},
                            section.bounded && {label: "Free", value: section.free, opacity: 0.12}
                        ].filter(Boolean) as { label: string, value: number, opacity: number }[]

                        return <React.Fragment key={section.title}>
                            {index > 0 && <div style={{height: "1px", background: "rgba(255, 255, 255, 0.08)"}}/>}
                            <Flex style={{flexDirection: "column", gap: getSize("xs")}}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"primary"}>
                                        {section.title}
                                    </Text>
                                    {section.bounded && (
                                        <Text size={"sm"} hierarchy={"tertiary"}>
                                            {numberFormat.format(section.overall)} / {numberFormat.format(section.limit!)}
                                        </Text>
                                    )}
                                </Flex>
                                <ProgressLinear color={section.color} mah={"8px"} w={"100%"}
                                                {...(hasContext
                                                    ? {value: section.contextFill, predictionValue: section.overallFill}
                                                    : {value: section.overallFill})}/>
                                <Flex style={{gap: getSize("lg")}}>
                                    {legend.map(entry => (
                                        <Flex key={entry.label} style={{flexDirection: "column", gap: getSize("xxxs")}}>
                                            <Flex align={"center"} style={{gap: getSize("xs")}}>
                                                <div style={{
                                                    width: getSize("xs"),
                                                    height: getSize("xs"),
                                                    borderRadius: getSize("xxxs"),
                                                    background: section.color,
                                                    opacity: entry.opacity
                                                }}/>
                                                <Text size={"sm"} hierarchy={"tertiary"}>
                                                    {entry.label}
                                                </Text>
                                            </Flex>
                                            <Text size={"sm"}>
                                                {numberFormat.format(entry.value)}
                                            </Text>
                                        </Flex>
                                    ))}
                                </Flex>
                            </Flex>
                        </React.Fragment>
                    })}
                    {sections.some(section => section.color !== USAGE_NEUTRAL_COLOR) ? (
                        <UpgradeButtonComponent namespaceId={namespaceIndex}
                                                fullWidth
                                                paddingSize={"xxs"}/>
                    ) : null}
                </Flex>
            </TooltipContent>
        </TooltipPortal>
    </Tooltip>
}
