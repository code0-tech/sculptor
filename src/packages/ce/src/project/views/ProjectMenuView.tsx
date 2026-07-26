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
import {IconCheck, IconChevronDown, IconChevronRight, IconServer, IconSettings, IconSwitch} from "@tabler/icons-react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";

export const ProjectMenuView: React.FC = () => {

    const params = useParams()
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const namespaceNumber = params.namespaceId as any as number
    const projectNumber = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceNumber}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectNumber}`

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectStore, projectId, namespaceId]
    )

    const projects = React.useMemo(
        () => projectService.values({namespaceId})
            .filter((entry): entry is NamespaceProject => !!entry),
        [projectStore, namespaceId]
    )

    const name = project?.name ?? ""

    return <Menu>
        <MenuTrigger asChild>
            <Button paddingSize={"xxs"} style={{borderRadius: "50rem"}} w={"100%"}
                    variant={"none"} justify={"flex-start"}>
                <Avatar identifier={name} color={hashToColor(name, 0, 180)} size={16}/>
                <Flex align={"flex-start"} style={{flexDirection: "column", minWidth: 0}}>
                    <Text>
                        {name}
                    </Text>
                    <Text hierarchy={"tertiary"}>
                        Project
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
                    Project
                </MenuLabel>
                <Link href={`/namespace/${namespaceNumber}/project/${projectNumber}/settings`} prefetch
                      style={{display: "contents"}}>
                    <MenuItem>
                        <IconSettings size={16}/>
                        Settings
                    </MenuItem>
                </Link>
                <Link href={`/namespace/${namespaceNumber}/project/${projectNumber}/runtime`} prefetch
                      style={{display: "contents"}}>
                    <MenuItem>
                        <IconSettings color={"transparent"} size={16}/>
                        Servers
                    </MenuItem>
                </Link>
                <MenuSeparator/>
                <MenuSub>
                    <MenuSubTrigger>
                        <IconSwitch size={16}/>
                        <Flex align={"center"} justify={"space-between"} w={"100%"}>
                            Switch Project
                            <IconChevronRight size={16}/>
                        </Flex>
                    </MenuSubTrigger>
                    <MenuSubContent sideOffset={8} alignOffset={-4}>
                        {projects.map(entry => {
                            const number = entry.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
                            const entryName = entry.name ?? ""
                            return <Link key={entry.id} href={`/namespace/${namespaceNumber}/project/${number}`}
                                         prefetch style={{display: "contents"}}>
                                <MenuItem>
                                    <Avatar identifier={entryName} color={hashToColor(entryName, 0, 180)} size={16}/>
                                    <Flex align={"center"} justify={"space-between"} w={"100%"} style={{gap: "0.7rem"}}>
                                        {entryName}
                                        <IconCheck size={16}
                                                   color={entry.id === projectId ? undefined : "transparent"}/>
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
