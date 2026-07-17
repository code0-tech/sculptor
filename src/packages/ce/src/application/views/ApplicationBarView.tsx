"use client"

import {Button, Flex, MenuItem, MenuSeparator, Text, useService, useStore} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useParams, usePathname, useRouter} from "next/navigation";
import React from "react";
import Link from "next/link";
import {
    IconArrowLeft,
    IconArrowUpRight,
    IconBuilding,
    IconFolders,
    IconInbox,
    IconLogout,
    IconSearch, IconSettings,
    IconUser
} from "@tabler/icons-react";
import {ApplicationBreadcrumbView} from "@edition/application/views/ApplicationBreadcrumbView";
import UserMenuComponent from "@edition/user/components/UserMenuComponent";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {Island} from "@code0-tech/pictor/dist/components/island/Island";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";

export const ApplicationBarView: React.FC = () => {

    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const router = useRouter()
    const pathname = usePathname()
    const [loading, startTransition] = React.useTransition()
    const params = useParams()

    const namespaceIndex = params.namespaceId as string | undefined
    const projectIndex = params.projectId as string | undefined
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])
    const userNamespaceIndex = React.useMemo(() => currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1], [currentUser])
    const userIndex = currentUser?.id?.match(/User\/(\d+)$/)?.[1]
    const currentStep = projectIndex ? "project" : namespaceIndex ? "namespace" : "home";

    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex as any as number}`
    const namespace = React.useMemo(() => namespaceService.getById(namespaceId), [namespaceStore, namespaceId])
    const parentOrganization = React.useMemo(() => namespace?.parent?.__typename === "Organization" ? organizationService.getById(namespace?.parent?.id) : null, [organizationStore, namespace])

    const homeTabs = React.useMemo(() => {
        return [
            <Button paddingSize={"xxs"} key={"home"} variant={"none"}
                    aria-selected={pathname === "/"} onClick={() => router.push(`/`)}>
                <Text>Home</Text>
            </Button>,
            <Button paddingSize={"xxs"} key={"home"} variant={"none"}
                    aria-selected={pathname === "/workspaces"} onClick={() => router.push(`/workspaces`)}>
                <Text>Workspaces</Text>
            </Button>,
            ...(currentUser?.admin ? [
                <Button paddingSize={"xxs"} key={"users"} variant={"none"}
                        aria-selected={pathname.startsWith("/users")} onClick={() => router.push(`/users`)}>
                    <Text>Users</Text>
                </Button>,
                <Button paddingSize={"xxs"} key={"runtimes"} variant={"none"}
                        aria-selected={pathname.startsWith("/runtimes")} onClick={() => router.push(`/runtimes`)}>
                    <Text>Servers</Text>
                </Button>,
                <Button paddingSize={"xxs"} key={"settings"} variant={"none"}
                        aria-selected={pathname.startsWith("/settings")} onClick={() => router.push(`/settings`)}>
                    <Text>Settings</Text>
                </Button>
            ] : [])
        ]
    }, [currentUser, pathname])

    const namespaceTabs = React.useMemo(() => {
        const baseLink = `/namespace/${namespaceIndex}`
        const showSettings = (parentOrganization && (parentOrganization.userAbilities?.deleteOrganization
                || parentOrganization?.userAbilities?.updateOrganization))
            || namespace?.userAbilities?.createLicense
        //TODO add license check for enterprise features

        return [
            <Button paddingSize={"xxs"} key={"overview"} variant={"none"}
                    aria-selected={pathname === baseLink} onClick={() => router.push(baseLink)}>
                <Text>Overview</Text>
            </Button>,
            <Button paddingSize={"xxs"} key={"members"} variant={"none"}
                    aria-selected={pathname.includes("members")} onClick={() => router.push(`${baseLink}/members`)}>
                <Text>Members</Text>
            </Button>,
            <Button paddingSize={"xxs"} key={"roles"} variant={"none"}
                    aria-selected={pathname.includes("roles")} onClick={() => router.push(`${baseLink}/roles`)}>
                <Text>Roles</Text>
            </Button>,
            <Button paddingSize={"xxs"} key={"runtimes"} variant={"none"}
                    aria-selected={pathname.includes("runtimes")} onClick={() => router.push(`${baseLink}/runtimes`)}>
                <Text>Servers</Text>
            </Button>,
            ...(showSettings ? [
                <Button paddingSize={"xxs"} key={"settings"} variant={"none"}
                        aria-selected={pathname.includes("settings")}
                        onClick={() => router.push(`${baseLink}/settings`)}>
                    <Text>Settings</Text>
                </Button>
            ] : [])
        ]
    }, [namespace, parentOrganization, namespaceIndex, pathname])

    const projectTabs = React.useMemo(() => {
        const baseLink = `/namespace/${namespaceIndex}/project/${projectIndex}`

        return [
            <Button paddingSize={"xxs"} key={"flows"} variant={"none"}
                    aria-selected={pathname.includes("flow")} onClick={() => router.push(`${baseLink}/flow`)}>
                <Text>Flows</Text>
            </Button>,
            <Button paddingSize={"xxs"} key={"modules"} variant={"none"}
                    aria-selected={pathname.includes("module")} onClick={() => router.push(`${baseLink}/module`)}>
                <Text>Plugins</Text>
            </Button>,
            <Button paddingSize={"xxs"} key={"runtimes"} variant={"none"}
                    aria-selected={pathname.includes("runtime")} onClick={() => router.push(`${baseLink}/runtime`)}>
                <Text>Servers</Text>
            </Button>,
            <Button paddingSize={"xxs"} key={"settings"} variant={"none"}
                    aria-selected={pathname.includes("settings")} onClick={() => router.push(`${baseLink}/settings`)}>
                <Text>Settings</Text>
            </Button>
        ]
    }, [namespaceIndex, projectIndex, pathname])

    const userMenu = React.useMemo(() => {

        if (!currentUser || !currentSession) {
            return null
        }

        const userLogout = () => {
            startTransition(async () => {
                await userService.usersLogout({
                    userSessionId: currentSession.id!!
                }).then(payload => {
                    window.localStorage.removeItem("ide_code-zero_session")
                    router.push("/login")
                })
            })
        }

        return <UserMenuComponent userId={currentSession.user?.id!!}>
            <Link href={`/users/@me`}>
                <MenuItem>
                    <IconUser size={16}/>Profile
                </MenuItem>
            </Link>
            <Link href={`/users/@me/settings`}>
                <MenuItem>
                    <IconSettings size={16}/>Settings
                </MenuItem>
            </Link>
            <MenuSeparator/>
            <Link href={"/workspaces"}>
                <MenuItem>
                    <IconBuilding size={16}/>Workspaces
                </MenuItem>
            </Link>
            <Link href={`/namespace/${userNamespaceIndex}`}>
                <MenuItem>
                    <IconFolders size={16}/>Personal Workspace
                </MenuItem>
            </Link>
            <MenuSeparator/>
            <MenuItem onSelect={userLogout}>
                <IconLogout size={16}/>Logout
            </MenuItem>
        </UserMenuComponent>
    }, [currentUser, currentSession, userNamespaceIndex])

    return <Flex py={0.7} key={`island-${currentStep}`} align={"center"} justify={"space-between"}>
        {currentStep === "project" ? <Link tabIndex={-1} href={`/namespace/${namespaceIndex}`}>
            <Button color={"tertiary"} paddingSize={"xxs"}>
                <IconArrowLeft size={13}/>
                <Text>Go back to workspace</Text>
            </Button>
        </Link> : currentStep === "namespace" ? <Link tabIndex={-1} href={`/`}>
            <Button color={"tertiary"} paddingSize={"xxs"}>
                <IconArrowLeft size={13}/>
                <Text>Go back to home</Text>
            </Button>
        </Link> : <div/>}
        <Flex pos={"fixed"} top={"1rem"} left={"50%"} justify={"center"}
              style={{zIndex: 9999, transform: "translateX(-50%)"}}>
            <Island>
                <ButtonGroup bg={"transparent"}>
                    {currentStep === "project" ? projectTabs : currentStep === "namespace" ? namespaceTabs : homeTabs}
                </ButtonGroup>
            </Island>
        </Flex>
        <Flex align={"center"} style={{gap: ".7rem"}}>
            <Button disabled variant={"none"} paddingSize={"xs"}>
                <IconSearch size={16}/>
            </Button>
            <Button disabled variant={"none"} paddingSize={"xs"}>
                <IconInbox size={16}/>
            </Button>
            {userMenu}
        </Flex>
    </Flex>
}
