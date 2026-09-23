"use client"

import React from "react";
import {Button} from "@code0-tech/pictor";
import BorderBeam from "border-beam";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {getUsageProjectedFill} from "@core/util/usage";
import {getLicensePeriod} from "@core/util/license";

export interface UpgradeButtonComponentProps {
    reference: string
    namespaceId?: string | number
    fullWidth?: boolean
    color?: React.ComponentProps<typeof Button>["color"]
}

export const UpgradeButtonComponent: React.FC<UpgradeButtonComponentProps> = (props) => {

    const {reference, fullWidth, color = "tertiary"} = props

    const {licensed, atRisk} = useUsageOverview()
    const {license, licenseStartDate} = useUsageLicense()
    const [pending, startTransition] = React.useTransition()

    const display = fullWidth ? "block" : "inline-block"

    const {afterDate, beforeDate} = getLicensePeriod(licenseStartDate)
    const projected = (usage: typeof atRisk[number]) => getUsageProjectedFill(usage.used, usage.limit, afterDate, beforeDate)
    const worst = [...atRisk].sort((a, b) => projected(b) - projected(a))[0]
    const critical = !!worst && projected(worst) >= 90

    const openSubscription = React.useCallback(() => {
        const target = window.open("about:blank", "_blank")

        startTransition(async () => {

            const config = await Promise.resolve(fetch("/api/config").then(response => response.json()))
            const subscriptionUrl = config?.subscriptionUrl as string
            const checkoutUrl = config?.checkoutUrl as string

            if (!subscriptionUrl) {
                target?.close()
                return
            }

            const url = new URL(licensed && atRisk.length > 0 ? subscriptionUrl : checkoutUrl)

            url.searchParams.set("ref", reference)
            if (license?.licensee.license_id) url.searchParams.set("licenseId", license?.licensee.license_id)
            if (license?.licensee.subscription_id) url.searchParams.set("subscriptionId", license?.licensee.subscription_id)

            if (target) target.location.href = url.toString()
        })
    }, [licensed, atRisk, license])

    return <BorderBeam strength={1} size={"sm"} theme={"dark"} duration={5} style={{display}}>
        <Button onClick={openSubscription} disabled={pending} paddingSize={"xxs"} color={color}
                justify={"center"} w={fullWidth ? "100%" : undefined}>
            {licensed && atRisk.length > 0
                ? worst?.title === "AI tokens"
                    ? critical ? "Don't lose AI access" : "Keep AI available"
                    : critical ? "Don't let your flows stop" : "Keep your flows running"
                : "Unlock the full potential"}
        </Button>
    </BorderBeam>
}
