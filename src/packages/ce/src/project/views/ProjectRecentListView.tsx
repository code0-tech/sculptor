"use client"

import React from "react";
import {Avatar, Badge, Button, Flex, hashToColor, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import Link from "next/link";
import {NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";

const RECENT_PROJECTS_LIMIT = 10

export const ProjectRecentListView: React.FC = () => {

    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
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

    const projects = React.useMemo(
        () => memberships
            .flatMap(membership => membership?.namespace?.id
                ? projectService.values({namespaceId: membership.namespace.id})
                : [])
            .filter((project): project is NamespaceProject => !!project)
            .sort((a, b) => new Date(String(b.updatedAt)).getTime() - new Date(String(a.updatedAt)).getTime())
            .slice(0, RECENT_PROJECTS_LIMIT),
        [memberships.length, projectStore]
    )

    return <Flex style={{boxSizing: "border-box", flexDirection: 'column'}}>
        <Flex align={"center"} justify={"space-between"}>
            <Text pl={0.7} hierarchy={"tertiary"}>
                Recent projects
            </Text>
            <Badge color={"secondary"}>
                {projects.length}
            </Badge>
        </Flex>
        <Spacing spacing={"xxs"}/>
        {projects.map(project => {
            const namespaceNumber = project.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
            const projectNumber = project.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
            return <Link key={project.id}
                         href={`/namespace/${namespaceNumber}/project/${projectNumber}/flow`}
                         style={{width: "100%"}}
                         prefetch>
                <Button variant={"none"} w={"100%"} justify={"flex-start"} paddingSize={"xxs"}>
                    <Avatar identifier={project.name ?? ""} color={hashToColor(project?.name ?? "", 0, 180)} size={13}/>
                    <Text size={"md"}>
                        {project.name}
                    </Text>
                </Button>
            </Link>
        })}
    </Flex>
}
