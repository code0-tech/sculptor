"use client"

import React from "react";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";

export interface LicenseUpgrade {
    available: boolean
    pending: boolean
    upgrade: () => void
}

export const useLicenseUpgrade = (reference: string, namespaceId?: string | number): LicenseUpgrade => {

    const {licensed, atRisk} = useUsageOverview()
    const {license} = useUsageLicense()
    const [pending, startTransition] = React.useTransition()

    const upgrade = React.useCallback(() => {
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
    }, [reference, licensed, atRisk, license])

    return {available: true, pending, upgrade}
}
