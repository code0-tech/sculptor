"use client"

import React from "react";
import {Flex, Text} from "@code0-tech/pictor";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {UsageIndicatorComponent} from "@edition/usage/components/UsageIndicatorComponent";

const numberFormat = new Intl.NumberFormat()

export const AIUsageComponent: React.FC = () => {

    const {accessible, limits, overallUsage} = useUsageOverview()

    const used = overallUsage?.aiValue ?? 0
    const limit = limits.ai

    return <Flex align={"center"} justify={"space-between"} px={0.35} style={{gap: "0.35rem"}}>
        <Text>
            {!accessible || limit == null
                ? "Upgrade your license to increase your AI usage limit"
                : limit <= 0
                    ? "Your plan includes no AI tokens. Upgrade your license to use AI."
                    : `${numberFormat.format(used)} of ${numberFormat.format(limit)} AI tokens used this period`}
        </Text>
        <UsageIndicatorComponent metric={"ai"} side={"top"} align={"end"} paddingSize={"xxs"}/>
    </Flex>
}
