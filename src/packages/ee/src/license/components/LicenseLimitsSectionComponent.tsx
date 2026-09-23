"use client"

import React from "react";
import {Flex, getSize, Text} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {IconAlertTriangle} from "@tabler/icons-react";
import {getUsageProjectedFill, isUsageAtRisk, USAGE_WARNING_COLOR} from "@core/util/usage";

export interface LicenseLimitsSectionComponentProps {
    usages: Array<{ title: string, used: number, limit?: number | null }>
    afterDate: string
    beforeDate: string
    action: React.ReactNode
}

export const LicenseLimitsSectionComponent: React.FC<LicenseLimitsSectionComponentProps> = (props) => {

    const {usages, afterDate, beforeDate, action} = props

    const atRisk = usages.filter(usage => isUsageAtRisk(usage.used, usage.limit, afterDate, beforeDate))

    if (atRisk.length <= 0) return null

    const exceeding = atRisk.filter(
        usage => getUsageProjectedFill(usage.used, usage.limit, afterDate, beforeDate) >= 100
    )

    return <CardSection border style={{background: "#201813"}}>
        <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
            <Flex align={"center"} style={{gap: getSize("sm")}}>
                <IconAlertTriangle size={16} color={USAGE_WARNING_COLOR} style={{flexShrink: 0}}/>
                <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        {atRisk.length > 1 ? "Your limits are running out" : `Your ${atRisk[0].title.toLowerCase()} are running out`}
                    </Text>
                    <Text size={"md"} hierarchy={"tertiary"}>
                        {atRisk.map(usage => usage.title.toLowerCase()).join(" and ")}
                        {exceeding.length > 0
                            ? " will be used up before this period resets."
                            : " are close to their limit for this period."}
                        {" "}Increase your limits to avoid interruptions.
                    </Text>
                </Flex>
            </Flex>
            <Flex align={"center"} style={{flexShrink: 0}}>
                {action}
            </Flex>
        </Flex>
    </CardSection>
}
