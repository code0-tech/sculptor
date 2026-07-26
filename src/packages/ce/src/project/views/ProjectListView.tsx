"use client"

import React from "react";
import {Avatar, Badge, Button, Flex, hashToColor, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {IconPlus} from "@tabler/icons-react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";

export const ProjectListView: React.FC = () => {

    const params = useParams()
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const namespaceNumber = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceNumber}`

    const projects = React.useMemo(
        () => projectService.values({namespaceId})
            .filter((project): project is NamespaceProject => !!project),
        [namespaceId, projectStore]
    )

    return <Flex style={{boxSizing: "border-box", flexDirection: 'column'}}>
        <Flex align={"center"} justify={"space-between"}>
            <Text pl={0.7} hierarchy={"tertiary"}>
                Projects
            </Text>
            <Badge color={"secondary"}>
                {projects.length}
            </Badge>
        </Flex>
        <Spacing spacing={"xxs"}/>
        {projects.map(project => {
            const projectNumber = project.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
            return <Link key={project.id}
                         href={`/namespace/${namespaceNumber}/project/${projectNumber}`}
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
        <Link href={`/namespace/${namespaceNumber}/project/create`} style={{width: "100%"}} prefetch>
            <Button variant={"none"} w={"100%"} justify={"flex-start"} paddingSize={"xxs"}>
                <IconPlus size={13}/>
                <Text size={"md"} hierarchy={"tertiary"}>
                    Create Project
                </Text>
            </Button>
        </Link>
    </Flex>
}
