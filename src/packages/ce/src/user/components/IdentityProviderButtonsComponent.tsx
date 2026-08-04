"use client"

import React from "react";
import {Button, Text, toast, useService, useStore} from "@code0-tech/pictor";
import {IdentityProviderBasic} from "@code0-tech/sagittarius-graphql-types";
import {useRouter} from "next/navigation";
import {ApplicationService} from "@edition/application/services/Application.service";
import {
    IconBrandDiscord,
    IconBrandGithub,
    IconBrandGitlab,
    IconBrandGoogle,
    IconBrandWindows,
    IconFingerprint,
    IconKey,
    IconShieldLock
} from "@tabler/icons-react";

export type IdentityAuthIntent = "login" | "register" | "link"

export interface IdentityProviderButtonsComponentProps {
    intent: IdentityAuthIntent
    returnTo?: string
    excludeProviderIds?: string[]
}

export const IdentityProviderButtonsComponent: React.FC<IdentityProviderButtonsComponentProps> = (props) => {

    const {intent, returnTo, excludeProviderIds} = props

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()

    const providers = React.useMemo<IdentityProviderBasic[]>(
        () => (applicationService.get()?.identityProviders?.nodes ?? []).filter((node): node is IdentityProviderBasic => !!node),
        [applicationStore]
    )

    const visibleProviders = React.useMemo<IdentityProviderBasic[]>(
        () => providers.filter(provider => provider.id && !(excludeProviderIds ?? []).includes(provider.id)),
        [providers, excludeProviderIds]
    )

    const actionVerb = intent === "link" ? "Link" : "Continue with"

    const providerMeta = React.useCallback((type?: string | null): { label: string, icon: React.ReactNode } => {
        switch (type) {
            case "OIDC":
                return {label: "OpenID Connect", icon: <IconFingerprint size={16}/>}
            case "GOOGLE":
                return {label: "Google", icon: <IconBrandGoogle size={16}/>}
            case "GITHUB":
                return {label: "GitHub", icon: <IconBrandGithub size={16}/>}
            case "GITLAB":
                return {label: "GitLab", icon: <IconBrandGitlab size={16}/>}
            case "DISCORD":
                return {label: "Discord", icon: <IconBrandDiscord size={16}/>}
            case "MICROSOFT":
                return {label: "Microsoft", icon: <IconBrandWindows size={16}/>}
            case "SAML":
                return {label: "SAML", icon: <IconShieldLock size={16}/>}
            default:
                return {label: type ?? "Unknown", icon: <IconKey size={16}/>}
        }
    }, [])

    const buildLoginUrl = React.useCallback((loginUrl: string, providerId: string): string => {
        const state = {intent, providerId, returnTo}
        const encodedState = btoa(JSON.stringify(state)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
        const url = new URL(loginUrl)
        url.searchParams.set("state", encodedState)
        return url.toString()
    }, [intent, returnTo])

    const startAuth = React.useCallback((provider: IdentityProviderBasic) => {
        const providerId = provider.id
        if (!providerId || loading) return
        startTransition(() => {
            applicationService.getIdentityProviderLoginUrl(providerId).then(loginUrl => {
                if (!loginUrl) {
                    toast({title: "This provider isn't available right now. Please try again.", color: "error"})
                    return
                }
                router.push(buildLoginUrl(loginUrl, providerId))
            })
        })
    }, [loading, applicationService, buildLoginUrl, router])

    if (visibleProviders.length === 0) return null

    return <>
        {visibleProviders.map(provider => {
            const meta = providerMeta(provider.type)
            return <Button key={provider.id} w={"100%"}
                           mb={0.7}
                           color={"tertiary"}
                           disabled={loading}
                           onClick={() => startAuth(provider)}>
                {meta.icon}
                <Text>{actionVerb} {meta.label}</Text>
            </Button>
        })}
    </>
}
