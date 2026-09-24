"use client"

import React from "react";
import {useService} from "@code0-tech/pictor";
import {useRouter} from "next/navigation";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {UserService} from "@edition/user/services/User.service";
import {useLicensePurchased} from "@cloud-internal/license/hooks/License.purchased.hook";

export interface LicenseUpgrade {
    available: boolean
    pending: boolean
    upgrade: () => void
}

export const useLicenseUpgrade = (reference: string, namespaceId?: string | number): LicenseUpgrade => {

    const router = useRouter()
    const userService = useService(UserService)
    const {licensed, atRisk, namespaceIndex} = useUsageOverview()
    const {license} = useUsageLicense()
    const purchased = useLicensePurchased()
    const [pending, startTransition] = React.useTransition()

    const namespace = namespaceId ?? namespaceIndex

    const upgrade = React.useCallback(() => {

        if (!purchased) {
            const target = new URLSearchParams()
            target.set("ref", reference)
            if (namespace) target.set("namespace", namespace.toString())
            router.push(`/upgrade?${target.toString()}`)
            return
        }

        const target = window.open("about:blank", "_blank")

        startTransition(async () => {

            const [config, tokenPayload] = await Promise.all([
                fetch("/api/config").then(response => response.json()),
                userService.usersCreateCraterToken()
            ])

            const subscriptionUrl = config?.subscriptionUrl as string
            const checkoutUrl = config?.checkoutUrl as string
            const token = tokenPayload?.token?.token

            if (!subscriptionUrl || !checkoutUrl || !token) {
                target?.close()
                return
            }

            const url = new URL(licensed && atRisk.length > 0 ? subscriptionUrl : checkoutUrl)

            url.searchParams.set("ref", reference)
            url.searchParams.set("token", token)
            if (namespace) url.searchParams.set("namespace", namespace.toString())
            if (license?.licensee.license_id) url.searchParams.set("licenseId", license?.licensee.license_id)
            if (license?.licensee.subscription_id) url.searchParams.set("subscriptionId", license?.licensee.subscription_id)

            if (target) target.location.href = url.toString()
        })
    }, [purchased, reference, namespace, licensed, atRisk, license])

    return {available: true, pending, upgrade}
}
