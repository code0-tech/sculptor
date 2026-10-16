"use client"

import React from "react";
import {
    Alert,
    Avatar,
    Button,
    Card,
    Flex,
    hashToColor,
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
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {useUserSession} from "@ce-internal/user/hooks/User.session.hook";
import {useRouter, useSearchParams} from "next/navigation";
import {IconApiApp, IconCheck, IconChevronDown} from "@tabler/icons-react";
import {isValidRedirect} from "@core/util/redirect";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {OrganizationService} from "@ce-internal/organization/services/Organization.service";
import {UserService} from "@cloud-internal/user/services/User.service";
import {OrganizationView} from "@ce-internal/organization/services/Organization.view";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {LicensePlanBadgeComponent} from "@cloud-internal/license/components/LicensePlanBadgeComponent";

export const UserRedirectPage: React.FC = () => {

    const userSession = useUserSession()
    const params = useSearchParams()
    const callbackUrl = params.get("callbackUrl")
    const selectNamespace = params.get("selectNamespace")
    const cancelUrl = params.get("cancelUrl")
    const router = useRouter()
    const isValidCallback = isValidRedirect(callbackUrl)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const initialValues = React.useMemo(
        () => ({namespaceId: ""}),
        []
    )

    const [inputs, validate] = useForm<{
        namespaceId: string
    }>({
        useInitialValidation: false,
        initialValues,
        validate: {
            namespaceId: (value) => {
                if (selectNamespace && !value) return "Please select a workspace to continue"
                return null
            }
        },
        onSubmit: async (values) => {
            if (!callbackUrl || !userSession) return
            const payload = await userService.usersCreateCraterToken()
            const craterToken = payload?.token?.token
            if (!craterToken) return
            document.cookie = "codezero_callback=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "codezero_selectNamespace=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "codezero_cancel=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            const targetURL = new URL(callbackUrl)
            targetURL.searchParams.set('token', craterToken)
            if (selectNamespace && values.namespaceId) targetURL.searchParams.set('namespace', values.namespaceId)
            router.push(targetURL.toString())
        }
    })

    const namespaces = React.useMemo(
        () => [
            userSession?.user?.namespace?.id,
            ...organizationService.values()
                .filter((organization: OrganizationView) => organization.userAbilities)
                .map((organization: OrganizationView) => organization.namespace?.id)
        ]
            .filter((id): id is Namespace["id"] => !!id)
            .map(id => namespaceService.getById(id))
            .filter((namespace): namespace is Namespace => !!namespace)
            .map(namespace => {
                const name = getNamespaceName(namespace, organizationService, userService) ?? ""
                const user = namespace.parent?.__typename === "User"
                    ? userService.getById(namespace.parent.id) : undefined
                return {
                    id: namespace.id,
                    name,
                    title: user
                        ? `Personal organization of user @${user.username}`
                        : `Workspace with name @${name}`,
                    user,
                    license: namespace.currentLicense
                }
            }),
        [organizationStore, namespaceStore, userStore, userSession]
    )

    if (userSession === null) router.push("/login")

    return <>
        <Text size={"lg"} hierarchy={"primary"} display={"block"}>
            Authorize application
        </Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        <Spacing spacing={"xl"}/>
        {
            !isValidCallback && (
                <>
                    <Alert color={"error"}>
                        This is not a valid and verified application. Please go back if you don't trust the source of this
                        link.
                    </Alert>
                    <Spacing spacing={"xl"}/>
                </>
            )
        }
        <InputLabel>Application</InputLabel>
        <InputDescription>The external application you are granting access to.</InputDescription>
        <TextInput left={<IconApiApp size={16}/>} disabled value={`${callbackUrl}`}/>
        <Spacing spacing={"xl"}/>
        {
            selectNamespace && (
                <>
                    <InputLabel>Workspace</InputLabel>
                    <InputDescription>Choose the workspace this application can access.</InputDescription>
                    <SelectInput {...inputs.getInputProps("namespaceId")}>
                        <SelectTrigger asChild>
                            <Flex justify={"space-between"} align={"center"} px={0.7} py={0.7}>
                                <Text hierarchy={"secondary"}>
                                    <SelectValue placeholder={"Select a workspace"}/>
                                </Text>
                                <IconChevronDown size={13}/>
                            </Flex>
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectContent>
                                <SelectViewport key={namespaces.length}>
                                    {
                                        namespaces.map(namespace => (
                                            <SelectItem value={namespace.id ?? ""} key={namespace.id}>
                                                <SelectItemText>
                                                    <Flex align={"center"} style={{gap: "0.5rem"}}>
                                                        {namespace.user
                                                            ? <Avatar type={"character"}
                                                                      identifier={namespace.user.username ?? ""}
                                                                      size={16}/>
                                                            : <Avatar bg={"transparent"}
                                                                      color={hashToColor(namespace.name, 200, 360)}
                                                                      identifier={namespace.name} size={16}/>}
                                                        <Text>{namespace.title}</Text>
                                                    </Flex>
                                                </SelectItemText>
                                                <Flex align={"center"} style={{marginLeft: "auto"}}>
                                                    <LicensePlanBadgeComponent license={namespace.license}/>
                                                </Flex>
                                            </SelectItem>
                                        ))
                                    }
                                </SelectViewport>
                            </SelectContent>
                        </SelectPortal>
                    </SelectInput>
                    <Spacing spacing={"xl"}/>
                </>
            )
        }
        <InputLabel>Permissions</InputLabel>
        <InputDescription>The application is requesting permission to perform the following actions.</InputDescription>
        <Card color={"secondary"}>
            <CardSection border>
                <Flex style={{gap: "0.7rem"}} align={"center"}>
                    <IconCheck style={{minWidth: "1rem"}} size={16}/>
                    <Text>Can access your account information like email, username, and other stored information on your
                        account</Text>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex style={{gap: "0.7rem"}} align={"center"}>
                    <IconCheck size={16}/>
                    <Text>Can access, manage and edit workspaces</Text>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex style={{gap: "0.7rem"}} align={"center"}>
                    <IconCheck size={16}/>
                    <Text>Can access, manage and edit subscriptions</Text>
                </Flex>
            </CardSection>
        </Card>
        <Spacing spacing={"xl"}/>
        <Flex style={{gap: "0.7rem"}} align={"center"}>
            <Button type={"submit"} onClick={() => {
                document.cookie = "codezero_callback=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "codezero_selectNamespace=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "codezero_cancel=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = isValidRedirect(cancelUrl) ? cancelUrl! : "/"
            }} data-qa-selector={"auth-login-send"} color={isValidCallback ? "secondary" : "success"} w={"100%"}
                    mb={1.3}>
                No, go back
            </Button>
            <Button type={"submit"} onClick={() => validate()} data-qa-selector={"auth-login-send"}
                    color={isValidCallback ? "success" : "error"} w={"100%"} mb={1.3}>
                {isValidCallback ? "Authorize" : "Authorize and ignore warning"}
            </Button>
        </Flex>
    </>

}
