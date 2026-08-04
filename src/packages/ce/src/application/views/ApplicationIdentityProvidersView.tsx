"use client"

import React, {startTransition} from "react";
import {
    Badge,
    Button,
    ButtonGroup,
    DataTable,
    DataTableColumn,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {
    IconBrandDiscord,
    IconBrandGithub,
    IconBrandGitlab,
    IconBrandGoogle,
    IconBrandWindows,
    IconDotsVertical,
    IconFingerprint,
    IconKey,
    IconPlus,
    IconShieldLock,
    IconTrash
} from "@tabler/icons-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import type {
    IdentityProvider,
    IdentityProviderInput,
    OidcIdentityProviderConfig
} from "@code0-tech/sagittarius-graphql-types";
import {ApplicationService} from "@edition/application/services/Application.service";

export const ApplicationIdentityProvidersView: React.FC = () => {

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

    const router = useRouter()
    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const application = React.useMemo(() => applicationService.get(), [applicationStore])

    const providers = React.useMemo<IdentityProvider[]>(
        () => (application?.settings?.identityProviders?.nodes ?? []).filter((n): n is IdentityProvider => !!n),
        [application]
    )

    const handleDelete = React.useCallback((id: string) => {
        const next: IdentityProviderInput[] = providers.filter(p => p.id !== id).map((p): IdentityProviderInput => ({
            id: p.id!,
            type: p.type!,
            config: !p.config
                ? {}
                : p.config.__typename === "SamlIdentityProviderConfig"
                    ? {
                        providerName: p.config.providerName,
                        metadataUrl: p.config.metadataUrl,
                        settings: p.config.settings,
                        responseSettings: p.config.responseSettings,
                        attributeStatements: p.config.attributeStatements,
                    }
                    : {
                        providerName: (p.config as OidcIdentityProviderConfig).providerName,
                        clientId: (p.config as OidcIdentityProviderConfig).clientId,
                        clientSecret: (p.config as OidcIdentityProviderConfig).clientSecret,
                        redirectUri: (p.config as OidcIdentityProviderConfig).redirectUri,
                        ...(p.type === "OIDC" ? {
                            authorizationUrl: (p.config as OidcIdentityProviderConfig).authorizationUrl,
                            tokenUrl: (p.config as OidcIdentityProviderConfig).tokenUrl,
                            userDetailsUrl: (p.config as OidcIdentityProviderConfig).userDetailsUrl,
                            attributeStatements: (p.config as OidcIdentityProviderConfig).attributeStatements,
                        } : {}),
                    }
        }))
        startTransition(() => {
            applicationService.applicationUpdate({identityProviders: next}).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({title: "Removed identity provider", color: "success"})
                }
            })
        })
    }, [providers, applicationService])

    return <TabContent value={"identityProviders"}>
        <Flex justify={"space-between"} align={"center"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Identity providers</Text>
                <Badge color={"secondary"}>{providers.length}</Badge>
            </Flex>
            <ButtonGroup>
                <Link href={"/settings/identity-providers/create"}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Configure OAuth / OpenID Connect providers your users can log in and register with.
        </Text>
        <Spacing spacing={"md"}/>
        <DataTable filter={{}}
                   sort={{}}
                   onSelect={(provider) => {
                       if (provider?.id) router.push(`/settings/identity-providers/${encodeURIComponent(provider.id)}/settings`)
                   }}
                   emptyComponent={<DataTableColumn>
                       <Text size={"md"} hierarchy={"tertiary"}>
                           No identity providers configured. Add one to enable single sign-on.
                       </Text>
                   </DataTableColumn>}
                   data={providers}>
            {(provider) => {
                const meta = PROVIDER_TYPES.find(t => t.value === provider.type)
                    ?? {value: provider.type, label: provider.type ?? "Unknown", icon: <IconKey size={13}/>}
                return <>
                    <DataTableColumn pr={2.5}>
                        <Flex align={"center"} style={{gap: ".65rem"}}>
                            {meta.icon}
                            <Text size={"md"} hierarchy={"primary"}>
                                {provider.type === "SAML" || provider.type === "OIDC"
                                    ? provider.config?.providerName || provider.id
                                    : meta.label}
                            </Text>
                        </Flex>
                    </DataTableColumn>
                    <DataTableColumn onClick={(e) => e.stopPropagation()}>
                        <Menu>
                            <MenuTrigger asChild>
                                <Button variant={"none"} p={0.5}>
                                    <IconDotsVertical size={13}/>
                                </Button>
                            </MenuTrigger>
                            <MenuPortal>
                                <MenuContent sideOffset={8} align={"end"}>
                                    <MenuItem onSelect={() => handleDelete(provider.id!)}>
                                        <IconTrash size={13}/>
                                        Remove
                                    </MenuItem>
                                </MenuContent>
                            </MenuPortal>
                        </Menu>
                    </DataTableColumn>
                </>
            }}
        </DataTable>
    </TabContent>
}
