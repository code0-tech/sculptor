"use client"

import React from "react";
import {Button, useService} from "@code0-tech/pictor";
import Link from "next/link";
import {usePathname, useSearchParams} from "next/navigation";
import BorderBeam from "border-beam";
import {UserService} from "@edition/user/services/User.service";

export interface UpgradeButtonComponentProps {
    children?: React.ReactNode
    namespaceId?: string | number
    fullWidth?: boolean
    paddingSize?: React.ComponentProps<typeof Button>["paddingSize"]
    color?: React.ComponentProps<typeof Button>["color"]
    beamSize?: React.ComponentProps<typeof BorderBeam>["size"]
}

export const UpgradeButtonComponent: React.FC<UpgradeButtonComponentProps> = ({children, namespaceId, fullWidth, paddingSize, color = "tertiary", beamSize = "sm"}) => {

    const userService = useService(UserService)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [pending, startTransition] = React.useTransition()

    const isSubscription = pathname === "/upgrade"
    const namespace = namespaceId?.toString() ?? searchParams.get("namespace")
    const href = namespace ? `/upgrade?namespace=${namespace}` : "/upgrade"

    const display = fullWidth ? "block" : "inline-block"

    const openSubscription = () => {
        const target = window.open("about:blank", "_blank")
        startTransition(async () => {
            const [config, tokenPayload] = await Promise.all([
                fetch("/api/config").then(response => response.json()),
                userService.usersCreateCraterToken()
            ])
            const subscriptionUrl = config?.subscriptionUrl as string | null | undefined
            const token = tokenPayload?.token?.token
            if (!subscriptionUrl || !token) {
                target?.close()
                return
            }
            const url = new URL(subscriptionUrl)
            if (namespace) url.searchParams.set("namespace", namespace)
            url.searchParams.set("token", token)
            if (target) target.location.href = url.toString()
        })
    }

    const inner = <BorderBeam strength={1} size={beamSize} theme={"dark"} duration={5} style={{display}}>
        <Button paddingSize={paddingSize} color={color} disabled={pending}
                onClick={isSubscription ? openSubscription : undefined}
                justify={"center"} w={fullWidth ? "100%" : undefined}>
            {children ?? "Upgrade your plan"}
        </Button>
    </BorderBeam>

    if (isSubscription) return <span style={{display}}>{inner}</span>

    return <Link href={href} style={{display}}>
        {inner}
    </Link>
}
