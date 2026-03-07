"use client"

import React from "react"
import {IconArrowDown, IconArrowUp, IconCornerDownLeft} from "@tabler/icons-react";
import {ProjectView} from "@edition/project/services/Project.view";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Flex, hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuProps,
    MenuSeparator,
    MenuTrigger,
    Spacing, Text,
    useService
} from "@code0-tech/pictor";
import {Namespace, Scalars} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";

export interface ProjectMenuComponentProps extends MenuProps {
    onProjectSelect: (project: ProjectView) => void
    namespaceId: Namespace["id"]
    filter?: (project: ProjectView, index: number) => boolean
    projectId?: Scalars['NamespaceProjectID']['output']
    children?: React.ReactNode
}

export const ProjectMenuComponent: React.FC<ProjectMenuComponentProps> = props => {

    const {onProjectSelect, namespaceId, filter = () => true, projectId, children} = props

    const projectService = useService(ProjectService)
    const projectStore = useService(ProjectService)
    const currentProject = projectService.getById(projectId)
    const projects = React.useMemo(() => projectService.values({namespaceId: namespaceId}).filter(filter), [projectStore, namespaceId])

    return React.useMemo(() => {
        return (
            <Menu {...props}>
                <MenuTrigger asChild>
                    {children ? children : (
                        <Button variant={"none"} paddingSize={"xxs"}>
                            {currentProject?.name}
                        </Button>
                    )}
                </MenuTrigger>
                <MenuPortal>
                    <MenuContent side={"bottom"} align={"center"} sideOffset={8} maw={"210px"} color={"secondary"}>
                        <Card paddingSize={"xxs"} mt={-0.35} mx={-0.35} style={{borderWidth: "2px"}}>
                            {projects.map((project, index) => (
                                <>
                                    <MenuItem
                                        key={project.id}
                                        onSelect={() => onProjectSelect(project)}
                                    >
                                        <Flex align={"center"} style={{gap: "0.7rem"}}>
                                            <Avatar size={32}
                                                    color={hashToColor(project?.name ?? "", 0, 180)}
                                                    identifier={project?.name ?? ""}/>
                                            <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                                <Text size={"md"} hierarchy={"primary"}>
                                                    {project?.name}
                                                </Text>
                                                <Text>
                                                    {project?.description}
                                                </Text>
                                            </Flex>
                                        </Flex>

                                    </MenuItem>
                                    {index < projects.length - 1 && <MenuSeparator/>}
                                </>
                            ))}
                        </Card>
                        <MenuLabel>
                            <Flex style={{gap: ".35rem"}}>
                                <Flex align={"center"} style={{gap: "0.35rem"}}>
                                    <Flex>
                                        <Badge border><IconArrowUp size={12}/></Badge>
                                        <Badge border><IconArrowDown size={12}/></Badge>
                                    </Flex>
                                    move
                                </Flex>
                                <Spacing spacing={"xxs"}/>
                                <Flex align={"center"} style={{gap: ".35rem"}}>
                                    <Badge border><IconCornerDownLeft size={12}/></Badge>
                                    add
                                </Flex>
                            </Flex>
                        </MenuLabel>
                    </MenuContent>
                </MenuPortal>
            </Menu>
        )
    }, [projectStore])
}