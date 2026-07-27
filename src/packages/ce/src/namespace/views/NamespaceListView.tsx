"use client"

import React from "react";
import {Avatar, Badge, Button, Flex, hashToColor, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {IconPlus} from "@tabler/icons-react";
import Link from "next/link";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

export const NamespaceListView: React.FC = () => {

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

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
            .filter((namespace): namespace is Namespace => !!namespace),
        [memberships.length, namespaceStore]
    )

    return <Flex style={{boxSizing: "border-box", flexDirection: 'column'}}>
        <Flex align={"center"} justify={"space-between"}>
            <Text pl={0.7} hierarchy={"tertiary"}>
                Workspaces
            </Text>
            <Badge color={"secondary"}>
                {namespaces.length}
            </Badge>
        </Flex>
        <Spacing spacing={"xxs"}/>
        {namespaces.map(namespace => {
            const number = namespace.id?.match(/Namespace\/(\d+)$/)?.[1]
            const name = getNamespaceName(namespace, organizationService, userService) ?? ""
            const isPersonal = namespace.parent?.__typename === "User"
            const user = namespace.parent?.__typename === "User"
                ? userService.getById(namespace.parent.id) : undefined
            return <Link key={namespace.id} href={`/namespace/${number}`} style={{width: "100%"}} prefetch>
                <Button variant={"none"} w={"100%"} justify={"flex-start"} paddingSize={"xxs"}>
                    {isPersonal
                        ? <Avatar type={"character"} identifier={user?.username ?? ""} size={13}/>
                        : <Avatar bg={"transparent"} color={hashToColor(name, 200, 360)}
                                  identifier={name} size={13}/>}
                    <Text size={"md"}>
                        {name}
                    </Text>
                </Button>
            </Link>
        })}
        <Link href={"/workspaces/create"} style={{width: "100%"}} prefetch>
            <Button variant={"none"} w={"100%"} justify={"flex-start"} paddingSize={"xxs"}>
                <IconPlus size={13}/>
                <Text size={"md"} hierarchy={"tertiary"}>
                    Create Workspace
                </Text>
            </Button>
        </Link>
    </Flex>
}
