"use client"

import React from "react";
import {useService} from "@code0-tech/pictor";
import {useRouter} from "next/navigation";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {UserService} from "@edition/user/services/User.service";
import {useLicensePurchased} from "@cloud-internal/license/hooks/License.purchased.hook";
import {getLicenseCheckoutUrl} from "@core/util/license";

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

    const router = useRouter()
    const userService = useService(UserService)
    const {licensed, atRisk, namespaceIndex} = useUsageOverview()
    const {license: currentLicense} = useUsageLicense()
    const purchased = useLicensePurchased()
    const [pending, startTransition] = React.useTransition()

    const namespace = namespaceId ?? namespaceIndex
    const target = options?.target
    const license = options?.license ?? currentLicense

    const upgrade = React.useCallback(() => {

        if (!target && !purchased) {
            const params = new URLSearchParams()
            params.set("ref", reference)
            if (namespace) params.set("namespace", namespace.toString())
            router.push(`/upgrade?${params.toString()}`)
            return
        }

        const frame = window.open("about:blank", "_blank")

        startTransition(async () => {

            const [config, tokenPayload] = await Promise.all([
                fetch("/api/config").then(response => response.json()),
                userService.usersCreateCraterToken()
            ])

            const subscriptionUrl = config?.subscriptionUrl as string
            const checkoutUrl = config?.checkoutUrl as string
            const token = tokenPayload?.token?.token

            const manage = target ? target === "subscription" : licensed && atRisk.length > 0
            const resolved = manage ? subscriptionUrl : checkoutUrl

            if (!resolved || !token) {
                frame?.close()
                return
            }

            const url = manage ? new URL(resolved) : getLicenseCheckoutUrl(resolved, "cloud")

            url.searchParams.set("ref", reference)
            url.searchParams.set("token", token)
            if (namespace) url.searchParams.set("namespace", namespace.toString())
            if (license?.licensee.license_id) url.searchParams.set("licenseId", license.licensee.license_id)
            if (license?.licensee.subscription_id) url.searchParams.set("subscriptionId", license.licensee.subscription_id)

            if (frame) frame.location.href = url.toString()
        })
    }, [purchased, reference, namespace, target, licensed, atRisk, license])

    return {available: true, pending, upgrade}
}
