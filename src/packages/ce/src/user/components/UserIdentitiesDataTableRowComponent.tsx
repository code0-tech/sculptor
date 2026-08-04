"use client"

import React from "react";
import {User, UserIdentity} from "@code0-tech/sagittarius-graphql-types";
import {Button, DataTableColumn, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {
    IconBrandDiscord,
    IconBrandGithub,
    IconBrandGitlab,
    IconBrandGoogle,
    IconBrandWindows,
    IconFingerprint,
    IconKey,
    IconShieldLock,
    IconUnlink
} from "@tabler/icons-react";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";

export interface UserIdentitiesDataTableRowComponentProps {
    userId: User['id']
    identityId: UserIdentity['id']
    providerType?: string | null
}

export const UserIdentitiesDataTableRowComponent: React.FC<UserIdentitiesDataTableRowComponentProps> = (props) => {

    const {userId, identityId, providerType} = props

    type ProviderTypeValue = "OIDC" | "GOOGLE" | "GITHUB" | "GITLAB" | "DISCORD" | "MICROSOFT" | "SAML"

    const PROVIDER_TYPES: { value: ProviderTypeValue, label: string, icon: React.ReactNode }[] = [
        {value: "OIDC", label: "OpenID Connect", icon: <IconFingerprint size={13}/>},
        {value: "GOOGLE", label: "Google", icon: <IconBrandGoogle size={13}/>},
        {value: "GITHUB", label: "GitHub", icon: <IconBrandGithub size={13}/>},
        {value: "GITLAB", label: "GitLab", icon: <IconBrandGitlab size={13}/>},
        {value: "DISCORD", label: "Discord", icon: <IconBrandDiscord size={13}/>},
        {value: "MICROSOFT", label: "Microsoft", icon: <IconBrandWindows size={13}/>},
        {value: "SAML", label: "SAML", icon: <IconShieldLock size={13}/>},
    ]

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const identity = React.useMemo(
        () => userService.getById(userId)?.identities?.nodes?.find(identity => identity?.id === identityId) as UserIdentity | undefined,
        [userStore, userId, identityId]
    )

    const unlink = React.useCallback(() => {
        if (!identityId) return
        userService.usersIdentityUnlink({identityId}).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                toast({title: "Account unlinked", color: "success"})
            }
        })
    }, [identityId])

    if (!identity) return null

    const meta = PROVIDER_TYPES.find(t => t.value === providerType)
        ?? {label: providerType ?? identity.providerId ?? "Unknown", icon: <IconKey size={13}/>}

    return <>
        <DataTableColumn pr={2.5}>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                {meta.icon}
                <Flex style={{flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>{meta.label}</Text>
                    {identity.identifier && (
                        <Text size={"xs"} hierarchy={"tertiary"}>{identity.identifier}</Text>
                    )}
                </Flex>
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            <Button p={0.5} color={"error"} variant={"none"} onClick={unlink}>
                <IconUnlink size={16}/>
            </Button>
        </DataTableColumn>
    </>
}
