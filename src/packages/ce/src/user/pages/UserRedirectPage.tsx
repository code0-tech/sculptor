"use client"

import React from "react";
import {
    Alert,
    Button,
    Card,
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
    useService,
    useStore
} from "@code0-tech/pictor";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {useRouter, useSearchParams} from "next/navigation";
import {IconApiApp, IconCheck, IconChevronDown} from "@tabler/icons-react";
import {isValidRedirect} from "@core/util/redirect";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {OrganizationView} from "@edition/organization/services/Organization.view";

export const UserRedirectPage: React.FC = () => {

    const userSession = useUserSession()
    const params = useSearchParams()
    const callbackUrl = params.get("callbackUrl")
    const selectNamespace = params.get("selectNamespace")
    const router = useRouter()
    const isValidCallback = isValidRedirect(callbackUrl)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)

    const namespaces: ({
        title?: string
        id?: string
    })[] = React.useMemo(
        () => [{
            title: `Personal organization of user @${userSession?.user?.username}`,
            id: userSession?.user?.namespace?.id!
        }, ...organizationService.values().filter((organization: OrganizationView) => organization.userAbilities).map((organization: OrganizationView) => ({
            id: organization.namespace?.id!,
            title: `Organization with name @${organization.name}`
        }))],
        [organizationStore.length, userSession]
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
                    <InputLabel>Organization</InputLabel>
                    <InputDescription>Choose the organization this application can access.</InputDescription>
                    <SelectInput>
                        <SelectTrigger asChild>
                            <Flex justify={"space-between"} align={"center"} px={0.7} py={0.7}>
                                <Text hierarchy={"secondary"}>
                                    <SelectValue placeholder={"Select an organization"}/>
                                </Text>
                                <IconChevronDown size={13}/>
                            </Flex>
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectContent>
                                <SelectViewport key={namespaces.length}>
                                    {
                                        namespaces.map(namespace => (
                                            <SelectItem value={namespace.id ?? "unique"}>
                                                <SelectItemText>
                                                    <Text>{namespace.title}</Text>
                                                </SelectItemText>
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
                    <Text>Can access, manage and edit organizations</Text>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex style={{gap: "0.7rem"}} align={"center"}>
                    <IconCheck size={16}/>
                    <Text>Can access, manage and edit licenses</Text>
                </Flex>
            </CardSection>
        </Card>
        <Spacing spacing={"xl"}/>
        <Flex style={{gap: "0.7rem"}} align={"center"}>
            <Button type={"submit"} onClick={() => {
                document.cookie = "codezero_callback=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "codezero_selectNamespace=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                router.push("/")
            }} data-qa-selector={"auth-login-send"} color={isValidCallback ? "secondary" : "success"} w={"100%"}
                    mb={1.3}>
                No, go back
            </Button>
            <Button type={"submit"} onClick={() => {
                if (callbackUrl && userSession) {
                    document.cookie = "codezero_callback=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "codezero_selectNamespace=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    const targetURL = new URL(callbackUrl)
                    targetURL.searchParams.set('token', userSession?.token ?? "")
                    router.push(targetURL.toString())
                }
            }} data-qa-selector={"auth-login-send"} color={isValidCallback ? "success" : "error"} w={"100%"} mb={1.3}>
                {isValidCallback ? "Authorize" : "Authorize and ignore warning"}
            </Button>
        </Flex>
    </>

}