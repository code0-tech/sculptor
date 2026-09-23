"use client"

import React from "react";
import {Flex, getSize, Text} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {IconAlertTriangle} from "@tabler/icons-react";
import {
    getUsageRiskDescription,
    getUsageRiskTitle,
    getUsagesAtRisk,
    UsageLimitEntry,
    USAGE_WARNING_COLOR
} from "@core/util/usage";

export interface LicenseLimitsSectionComponentProps {
    usages: UsageLimitEntry[]
    afterDate: string
    beforeDate: string
    action: React.ReactNode
}

export const LicenseLimitsSectionComponent: React.FC<LicenseLimitsSectionComponentProps> = (props) => {

    const {usages, afterDate, beforeDate, action} = props

    const atRisk = getUsagesAtRisk(usages, afterDate, beforeDate)

    if (atRisk.length <= 0) return null

    return <CardSection border style={{background: "#201813"}}>
        <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
            <Flex align={"center"} style={{gap: getSize("sm")}}>
                <IconAlertTriangle size={16} color={USAGE_WARNING_COLOR} style={{flexShrink: 0}}/>
                <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        {getUsageRiskTitle(atRisk)}
                    </Text>
                    <Text size={"md"} hierarchy={"tertiary"}>
                        {getUsageRiskDescription(atRisk, afterDate, beforeDate)}
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
