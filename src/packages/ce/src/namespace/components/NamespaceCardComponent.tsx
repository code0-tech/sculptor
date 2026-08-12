"use client"

import React from "react";
import {Avatar, Badge, Card, Flex, hashToColor, Text, useService} from "@code0-tech/pictor";
import {IconFolders, IconUsers} from "@tabler/icons-react";
import Link from "next/link";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

export interface NamespaceCardComponentProps {
    namespace: Namespace
}

export const NamespaceCardComponent: React.FC<NamespaceCardComponentProps> = (props) => {

    const {namespace} = props

    const organizationService = useService(OrganizationService)
    const userService = useService(UserService)

    const number = namespace.id?.match(/Namespace\/(\d+)$/)?.[1]
    const name = getNamespaceName(namespace, organizationService, userService) ?? ""
    const isPersonal = namespace.parent?.__typename === "User"
    const user = namespace.parent?.__typename === "User"
        ? userService.getById(namespace.parent.id) : undefined

    return <Link href={`/namespace/${number}`} prefetch style={{display: "contents"}}>
        <Card color={"secondary"} clickable h={"100%"}>
            <Flex style={{flexDirection: "column", gap: "1.25rem"}}>
                <Flex align={"center"} style={{gap: "0.85rem"}}>
                    {isPersonal
                        ? <Avatar type={"character"} identifier={user?.username ?? ""} size={24}/>
                        : <Avatar color={hashToColor(name, 200, 360)}
                                  bg={"transparent"} identifier={name} size={24}/>}
                    <Flex align={"center"} style={{gap: "0.5rem", minWidth: 0, flex: 1}}>
                        <Text size={"md"} hierarchy={"primary"} fw={500}>{name}</Text>
                        {isPersonal && <Badge color={"info"}>Personal</Badge>}
                    </Flex>
                </Flex>
                <Flex align={"center"} style={{gap: "1.25rem"}}>
                    <Flex align={"center"} style={{gap: "0.4rem"}}>
                        <IconFolders size={15}/>
                        <Text size={"sm"} hierarchy={"tertiary"}>
                            {namespace.projects?.count ?? 0} projects
                        </Text>
                    </Flex>
                    <Flex align={"center"} style={{gap: "0.4rem"}}>
                        <IconUsers size={15}/>
                        <Text size={"sm"} hierarchy={"tertiary"}>
                            {namespace.members?.count ?? 0} members
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    </Link>
}
