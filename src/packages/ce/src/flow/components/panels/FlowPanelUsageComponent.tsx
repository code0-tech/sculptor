"use client"

import React from "react";
import {Flex, getSize, Text} from "@code0-tech/pictor";
import {getUsageColor, getUsageRiskDescription, isUsageAtRisk} from "@core/util/usage";
import {getLicensePeriod} from "@core/util/license";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {useLicenseUpgrade} from "@edition/license/hooks/License.upgrade.hook";

export const FlowPanelUsageComponent: React.FC = () => {

    const {usages} = useUsageOverview()
    const {licenseStartDate} = useUsageLicense()
    const {pending, upgrade} = useLicenseUpgrade("flow_builder_usage")

    const {afterDate, beforeDate} = getLicensePeriod(licenseStartDate)
    const workflow = usages.find(usage => usage.title === "Workflow executions")

    if (!workflow || !isUsageAtRisk(workflow.used, workflow.limit, afterDate, beforeDate)) return null

    return <Flex justify={"center"} align={"center"} style={{paddingBottom: getSize("xs")}}>
        <Text onClick={pending ? undefined : upgrade}
              style={{cursor: "pointer", color: getUsageColor(workflow.used, workflow.limit)}}>
            {getUsageRiskDescription([workflow], afterDate, beforeDate)}
        </Text>
    </Flex>
}
