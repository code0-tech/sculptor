"use client"

import React, {startTransition} from "react";
import {
    Button,
    Flex,
    InputDescription,
    InputLabel,
    SelectContent,
    SelectInput,
    SelectItem,
    SelectItemText,
    SelectPortal,
    SelectTrigger,
    SelectValue,
    SelectViewport,
    Spacing,
    Text,
    TextInput,
    toast,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {
    IconBrandDiscord,
    IconBrandGithub,
    IconBrandGitlab,
    IconBrandGoogle,
    IconBrandWindows,
    IconChevronDown,
    IconFingerprint,
    IconShieldLock
} from "@tabler/icons-react";
import type {
    IdentityProvider,
    IdentityProviderConfigInput,
    IdentityProviderInput,
    IdentityProviderType,
    OidcIdentityProviderConfig,
    SamlIdentityProviderConfig
} from "@code0-tech/sagittarius-graphql-types";
import {InputDialog} from "@core/components/InputDialog";
import {ApplicationService} from "@edition/application/services/Application.service";

export interface IdentityProviderSettingDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    identityProviderId?: string
}

export const IdentityProviderSettingDialogComponent: React.FC<IdentityProviderSettingDialogComponentProps> = (props) => {

    const {open, onOpenChange, identityProviderId} = props

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

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const providers = React.useMemo<IdentityProvider[]>(
        () => (applicationService.get()?.settings?.identityProviders?.nodes ?? []).filter((n): n is IdentityProvider => !!n),
        [applicationStore]
    )

    const provider = React.useMemo(
        () => identityProviderId ? providers.find(p => p.id === identityProviderId) : undefined,
        [providers, identityProviderId]
    )

    const oidc = provider?.config?.__typename === "OidcIdentityProviderConfig"
        ? provider.config as OidcIdentityProviderConfig
        : undefined
    const saml = provider?.config?.__typename === "SamlIdentityProviderConfig"
        ? provider.config as SamlIdentityProviderConfig
        : undefined

    const [type, setType] = React.useState<ProviderTypeValue>((provider?.type as ProviderTypeValue) ?? "OIDC")

    const typeRef = React.useRef(type)
    typeRef.current = type

    const initialValues = React.useMemo(() => ({
        providerName: provider?.config?.providerName ?? "",
        clientId: oidc?.clientId ?? "",
        clientSecret: oidc?.clientSecret ?? "",
        authorizationUrl: oidc?.authorizationUrl ?? "",
        tokenUrl: oidc?.tokenUrl ?? "",
        userDetailsUrl: oidc?.userDetailsUrl ?? "",
        redirectUri: oidc?.redirectUri ?? "",
        metadataUrl: saml?.metadataUrl ?? "",
    }), [provider])

    const [inputs, validate] = useForm<{
        providerName: string,
        clientId: string,
        clientSecret: string,
        authorizationUrl: string,
        tokenUrl: string,
        userDetailsUrl: string,
        redirectUri: string,
        metadataUrl: string,
    }>({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {
            providerName: (value) => (!value ? "Provider name is required" : null),
            clientId: (value) => (typeRef.current !== "SAML" && !value ? "Client ID is required" : null),
            clientSecret: (value) => (typeRef.current !== "SAML" && !value ? "Client secret is required" : null),
            redirectUri: (value) => (typeRef.current !== "SAML" && !value ? "Redirect URI is required" : null),
            authorizationUrl: (value) => (typeRef.current === "OIDC" && !value ? "Authorization URL is required" : null),
            tokenUrl: (value) => (typeRef.current === "OIDC" && !value ? "Token URL is required" : null),
            userDetailsUrl: (value) => (typeRef.current === "OIDC" && !value ? "User details URL is required" : null),
            metadataUrl: (value) => (typeRef.current === "SAML" && !value ? "Metadata URL is required" : null),
        },
        onSubmit: (values) => {
            const id = provider?.id
                ?? (() => {
                    const base = values.providerName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || type.toLowerCase()
                    const taken = new Set(providers.map(p => p.id))
                    if (!taken.has(base)) return base
                    let index = 2
                    while (taken.has(`${base}-${index}`)) index++
                    return `${base}-${index}`
                })()

            const config: IdentityProviderConfigInput = type === "SAML"
                ? {
                    providerName: values.providerName,
                    metadataUrl: values.metadataUrl,
                    settings: saml?.settings,
                    responseSettings: saml?.responseSettings,
                    attributeStatements: saml?.attributeStatements ?? {},
                }
                : {
                    providerName: values.providerName,
                    clientId: values.clientId,
                    clientSecret: values.clientSecret,
                    redirectUri: values.redirectUri,
                    ...(type === "OIDC" ? {
                        authorizationUrl: values.authorizationUrl,
                        tokenUrl: values.tokenUrl,
                        userDetailsUrl: values.userDetailsUrl,
                        attributeStatements: oidc?.attributeStatements ?? {},
                    } : {}),
                }

            const input: IdentityProviderInput = {id, type: type as IdentityProviderType, config}
            const others = (applicationService.get()?.settings?.identityProviders?.nodes ?? [])
                .filter((n): n is IdentityProvider => !!n)
                .filter(p => p.id !== input.id)
                .map(p => ({
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
            const next: IdentityProviderInput[] = [...others, input]

            startTransition(() => {
                applicationService.applicationUpdate({identityProviders: next}).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({title: provider ? "Updated identity provider" : "Added identity provider", color: "success"})
                        onOpenChange?.(false)
                    }
                })
            })
        }
    })

    return <InputDialog
        title={identityProviderId ? "Configure identity provider" : "Add identity provider"}
        description={"Provide the OAuth / OpenID Connect credentials issued by your provider so users can log in and register with it."}
        open={open}
        onOpenChange={(open) => onOpenChange?.(open)}>
        <InputLabel>Provider type</InputLabel>
        <InputDescription>The kind of identity provider to connect.</InputDescription>
        <SelectInput value={type} onValueChange={(value) => setType(value as ProviderTypeValue)}>
            <SelectTrigger asChild>
                <Flex justify={"space-between"} align={"center"} px={0.7} py={0.7}>
                    <Text hierarchy={"secondary"}>
                        <SelectValue placeholder={"Select a type"}/>
                    </Text>
                    <IconChevronDown size={13}/>
                </Flex>
            </SelectTrigger>
            <SelectPortal>
                <SelectContent side={"bottom"} sideOffset={8} position={"popper"}>
                    <SelectViewport>
                        {PROVIDER_TYPES.map(t => (
                            <SelectItem value={t.value} key={t.value}>
                                <SelectItemText>
                                    <Flex align={"center"} style={{gap: ".5rem"}}>
                                        {t.icon}
                                        <Text>{t.label}</Text>
                                    </Flex>
                                </SelectItemText>
                            </SelectItem>
                        ))}
                    </SelectViewport>
                </SelectContent>
            </SelectPortal>
        </SelectInput>
        <Spacing spacing={"md"}/>
        <TextInput required w={"100%"} title={"Provider name"}
                   description={"A display name shown to users on the login screen."}
                   placeholder={"E.g. Company SSO"}
                   {...inputs.getInputProps("providerName")}/>
        {type === "SAML" ? (
            <>
                <Spacing spacing={"md"}/>
                <TextInput required w={"100%"} title={"Metadata URL"}
                           description={"The SAML metadata URL provided by your identity provider."}
                           placeholder={"https://provider.com/saml/metadata"}
                           {...inputs.getInputProps("metadataUrl")}/>
            </>
        ) : (
            <>
                <Spacing spacing={"md"}/>
                <TextInput required w={"100%"} title={"Client ID"}
                           description={"The client ID issued by your identity provider."}
                           {...inputs.getInputProps("clientId")}/>
                <Spacing spacing={"md"}/>
                <TextInput required w={"100%"} title={"Client secret"}
                           description={"The client secret issued by your identity provider."}
                           {...inputs.getInputProps("clientSecret")}/>
                {type === "OIDC" && (
                    <>
                        <Spacing spacing={"md"}/>
                        <TextInput required w={"100%"} title={"Authorization URL"}
                                   description={"The provider endpoint used to start the OAuth flow."}
                                   placeholder={"https://provider.com/oauth/authorize"}
                                   {...inputs.getInputProps("authorizationUrl")}/>
                        <Spacing spacing={"md"}/>
                        <TextInput required w={"100%"} title={"Token URL"}
                                   description={"The provider endpoint used to exchange the authorization code for tokens."}
                                   placeholder={"https://provider.com/oauth/token"}
                                   {...inputs.getInputProps("tokenUrl")}/>
                        <Spacing spacing={"md"}/>
                        <TextInput required w={"100%"} title={"User details URL"}
                                   description={"The endpoint used to fetch the authenticated user's profile."}
                                   placeholder={"https://provider.com/oauth/userinfo"}
                                   {...inputs.getInputProps("userDetailsUrl")}/>
                    </>
                )}
                <Spacing spacing={"md"}/>
                <TextInput required w={"100%"} title={"Redirect URI"}
                           description={"The callback URL users are returned to after authenticating."}
                           placeholder={"https://sculptor.company.com/auth/callback"}
                           {...inputs.getInputProps("redirectUri")}/>
            </>
        )}
        <Spacing spacing={"xl"}/>
        <Button color={"success"} w={"100%"} onClick={validate}>
            {provider ? "Save changes" : "Add provider"}
        </Button>
    </InputDialog>
}
