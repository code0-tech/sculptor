"use client"

import React from "react";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";

export type LicenseUpgradeTarget = "checkout" | "subscription"

export interface LicenseUpgradeOptions {
    target?: LicenseUpgradeTarget
    license?: License | null
}

export interface LicenseUpgrade {
    available: boolean
    pending: boolean
    upgrade: () => void
}

export const useLicenseUpgrade = (reference: string, namespaceId?: string | number, options?: LicenseUpgradeOptions): LicenseUpgrade => {

    const {licensed, atRisk} = useUsageOverview()
    const [pending, startTransition] = React.useTransition()

    const target = options?.target

    const upgrade = React.useCallback(() => {
        const frame = window.open("about:blank", "_blank")

        startTransition(async () => {

            const config = await fetch("/api/config").then(response => response.json())
            const subscriptionUrl = config?.subscriptionUrl as string
            const checkoutUrl = config?.checkoutUrl as string

            const manage = target ? target === "subscription" : licensed && atRisk.length > 0
            const resolved = manage ? subscriptionUrl : checkoutUrl

            if (!resolved) {
                frame?.close()
                return
            }

            if (frame) frame.location.href = resolved
        })
    }, [target, licensed, atRisk])

    return {available: true, pending, upgrade}
}
