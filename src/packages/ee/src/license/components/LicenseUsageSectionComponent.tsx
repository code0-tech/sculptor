"use client"

import React from "react";
import {Flex, getSize, ProgressLinear, Text} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {parseISO} from "date-fns";
import {getUsageColor, getUsageFill} from "@core/util/usage";

const numberFormat = new Intl.NumberFormat()

export interface LicenseUsageSectionComponentProps {
    title: string
    unit: string
    used: number
    limit?: number | null
    afterDate: string
    beforeDate: string
}

export const LicenseUsageSectionComponent: React.FC<LicenseUsageSectionComponentProps> = (props) => {

    const {title, unit, used, limit, afterDate, beforeDate} = props

    const periodStart = parseISO(afterDate).getTime()
    const periodEnd = parseISO(beforeDate).getTime()
    const elapsed = Math.min(1, Math.max(0.01, (Date.now() - periodStart) / (periodEnd - periodStart)))

    const bounded = limit != null && limit > 0
    const exhausted = limit != null && limit <= 0

    const usedPercent = getUsageFill(used, limit)
    const projectedPercent = bounded ? Math.round((used / elapsed / limit!) * 100) : usedPercent

    return <CardSection border>
        <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
            <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                <Text size={"md"} hierarchy={"primary"}>
                    {title}
                </Text>
                <Text size={"md"} hierarchy={"tertiary"}>
                    {bounded ? <>
                        You used <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {usedPercent}%
                    </Text> of your <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {numberFormat.format(limit!)} {unit}
                    </Text> and will have used <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {projectedPercent}%
                    </Text> once the period resets.
                    </> : exhausted ? <>
                        Your plan includes <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        no {unit}
                    </Text>. Connect an active license to unlock them.
                    </> : <>
                        You used <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {numberFormat.format(used)} {unit}
                    </Text> in this period. Your plan has <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        no limit
                    </Text>.
                    </>}
                </Text>
            </Flex>
            <Flex align={"center"} style={{gap: getSize("xs"), flexShrink: 0}}>
                <ProgressLinear w={"100px"} h={"7.5px"} max={100}
                                value={usedPercent}
                                predictionValue={Math.min(100, projectedPercent)}
                                color={getUsageColor(used, limit)}/>
                <Text size={"md"} hierarchy={"primary"}>
                    {bounded ? `${usedPercent}%` : exhausted ? "none included" : "unlimited"}
                </Text>
            </Flex>
        </Flex>
    </CardSection>
}
