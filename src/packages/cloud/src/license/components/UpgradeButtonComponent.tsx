"use client"

import React from "react";
import {Button, useService} from "@code0-tech/pictor";
import BorderBeam from "border-beam";
import {useRouter} from "next/navigation";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {getUsageProjectedFill} from "@core/util/usage";
import {getLicensePeriod} from "@core/util/license";
import {UserService} from "@edition/user/services/User.service";
import {useLicensePurchased} from "@cloud-internal/license/hooks/License.purchased.hook";

export interface UpgradeButtonComponentProps {
    reference: string
    namespaceId?: string | number
    fullWidth?: boolean
    color?: React.ComponentProps<typeof Button>["color"]
}

export const UpgradeButtonComponent: React.FC<UpgradeButtonComponentProps> = (props) => {

    const {reference, namespaceId, fullWidth, color = "tertiary"} = props

    const router = useRouter()
    const userService = useService(UserService)
    const {licensed, atRisk, namespaceIndex} = useUsageOverview()
    const {license, licenseStartDate} = useUsageLicense()
    const purchased = useLicensePurchased()
    const [pending, startTransition] = React.useTransition()

    const display = fullWidth ? "block" : "inline-block"
    const namespace = namespaceId ?? namespaceIndex

    const {afterDate, beforeDate} = getLicensePeriod(licenseStartDate)
    const projected = (usage: typeof atRisk[number]) => getUsageProjectedFill(usage.used, usage.limit, afterDate, beforeDate)
    const worst = [...atRisk].sort((a, b) => projected(b) - projected(a))[0]
    const critical = !!worst && projected(worst) >= 90

    const openSubscription = React.useCallback(() => {

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
