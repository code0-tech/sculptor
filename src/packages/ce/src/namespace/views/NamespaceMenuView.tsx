"use client"

import React from "react";
import {
    Avatar,
    Button,
    Flex,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuSeparator,
    MenuSub,
    MenuSubContent,
    MenuSubTrigger,
    MenuTrigger,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {
    IconCheck,
    IconChevronDown,
    IconChevronRight,
    IconServer,
    IconSettings,
    IconShieldLock,
    IconSwitch,
    IconUsers
} from "@tabler/icons-react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

export const NamespaceMenuView: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const namespaceNumber = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceNumber}`

    const namespace = React.useMemo(
        () => namespaceService.getById(namespaceId),
        [namespaceStore, namespaceId]
    )

    const isPersonal = namespace?.parent?.__typename === "User"
    const user = isPersonal && namespace?.parent?.__typename === "User"
        ? userService.getById(namespace.parent.id) : undefined

    const name = React.useMemo(
        () => getNamespaceName(namespace, organizationService, userService) ?? "",
        [namespace, organizationStore, userStore]
    )

    const description = isPersonal ? "Personal workspace" : "Organization workspace"

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, userService, currentSession?.user?.id]
    )

    const memberships = React.useMemo(
        () => currentUser?.namespaceMemberships?.nodes ?? [],
        [currentUser?.namespaceMemberships?.nodes?.length]
    )

    const namespaces = React.useMemo(
        () => memberships
            .map(membership => namespaceService.getById(membership?.namespace?.id))
            .filter((it): it is Namespace => !!it),
        [memberships.length, namespaceStore]
    )

    return <Menu>
        <MenuTrigger asChild>
            <Button paddingSize={"xxs"} style={{borderRadius: "50rem"}} w={"100%"}
                    variant={"none"} justify={"flex-start"}>
                {isPersonal
                    ? <Avatar type={"character"} identifier={user?.username ?? ""} size={16}/>
                    : <Avatar bg={"transparent"} color={hashToColor(name, 200, 360)}
                              identifier={name} size={16}/>}
                <Flex align={"flex-start"} style={{flexDirection: "column", minWidth: 0}}>
                    <Text>
                        {name}
                    </Text>
                    <Text hierarchy={"tertiary"}>
                        {description}
                    </Text>
                </Flex>
                <Flex align={"center"} justify={"center"} style={{marginLeft: "auto"}}>
                    <IconChevronDown size={16}/>
                </Flex>
            </Button>
        </MenuTrigger>
        <MenuPortal>
            <MenuContent sideOffset={8} w={"var(--radix-popper-anchor-width)"}>
                <MenuLabel>
                    Workspace
                </MenuLabel>
                <Link href={`/namespace/${namespaceNumber}/settings`} prefetch style={{display: "contents"}}>
                    <MenuItem>
                        <IconSettings size={16}/>
                        Settings
                    </MenuItem>
                </Link>
                <Link href={`/namespace/${namespaceNumber}/members`} prefetch style={{display: "contents"}}>
                    <MenuItem>
                        Members
                    </MenuItem>
                </Link>
                <Link href={`/namespace/${namespaceNumber}/roles`} prefetch style={{display: "contents"}}>
                    <MenuItem>
                        Roles
                    </MenuItem>
                </Link>
                <Link href={`/namespace/${namespaceNumber}/runtimes`} prefetch style={{display: "contents"}}>
                    <MenuItem>
                        Servers
                    </MenuItem>
                </Link>
                <MenuSeparator/>
                <MenuSub>
                    <MenuSubTrigger>
                        <IconSwitch size={16}/>
                        <Flex align={"center"} justify={"space-between"} w={"100%"}>
                            Switch Workspace
                            <IconChevronRight size={16}/>
                        </Flex>
                    </MenuSubTrigger>
                    <MenuSubContent sideOffset={8} alignOffset={-4}>
                        {namespaces.map(entry => {
                            const number = entry.id?.match(/Namespace\/(\d+)$/)?.[1]
                            const entryPersonal = entry.parent?.__typename === "User"
                            const entryUser = entry.parent?.__typename === "User"
                                ? userService.getById(entry.parent.id) : undefined
                            const entryName = getNamespaceName(entry, organizationService, userService) ?? ""
                            return <Link key={entry.id} href={`/namespace/${number}`} prefetch
                                         style={{display: "contents"}}>
                                <MenuItem>
                                    {entryPersonal
                                        ? <Avatar type={"character"} identifier={entryUser?.username ?? ""} size={16}/>
                                        : <Avatar bg={"transparent"} color={hashToColor(entryName, 200, 360)}
                                                  identifier={entryName} size={16}/>}
                                    <Flex align={"center"} justify={"space-between"} w={"100%"} style={{gap: "0.7rem"}}>
                                        {entryName}
                                        <IconCheck size={16}
                                                   color={entry.id === namespaceId ? undefined : "transparent"}/>
                                    </Flex>
                                </MenuItem>
                            </Link>
                        })}
                    </MenuSubContent>
                </MenuSub>
            </MenuContent>
        </MenuPortal>
    </Menu>
}
