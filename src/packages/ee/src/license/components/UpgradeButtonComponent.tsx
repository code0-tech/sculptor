"use client"

import React from "react";
import {Button} from "@code0-tech/pictor";
import BorderBeam from "border-beam";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {useLicenseUpgrade} from "@edition/license/hooks/License.upgrade.hook";
import {getUsageUpgradeLabel} from "@core/util/usage";
import {getLicensePeriod} from "@core/util/license";

export interface UpgradeButtonComponentProps {
    reference: string
    namespaceId?: string | number
    fullWidth?: boolean
    color?: React.ComponentProps<typeof Button>["color"]
}

export const UpgradeButtonComponent: React.FC<UpgradeButtonComponentProps> = (props) => {

    const {reference, namespaceId, fullWidth, color = "tertiary"} = props

    const {licensed, atRisk} = useUsageOverview()
    const {licenseStartDate} = useUsageLicense()
    const {pending, upgrade} = useLicenseUpgrade(reference, namespaceId)

    const display = fullWidth ? "block" : "inline-block"

    const {afterDate, beforeDate} = getLicensePeriod(licenseStartDate)

    return <BorderBeam strength={1} size={"sm"} theme={"dark"} duration={5} style={{display}}>
        <Button onClick={upgrade} disabled={pending} paddingSize={"xxs"} color={color}
                justify={"center"} w={fullWidth ? "100%" : undefined}>
            {(licensed ? getUsageUpgradeLabel(atRisk, afterDate, beforeDate) : undefined) ?? "Unlock the full potential"}
        </Button>
    </BorderBeam>
}
