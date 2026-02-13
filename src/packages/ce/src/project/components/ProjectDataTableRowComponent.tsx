import React from "react";
import {NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {Avatar, DataTableColumn, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {ProjectService} from "@edition/project/services/Project.service";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {hashToColor} from "@code0-tech/pictor/dist/components/d-flow/DFlow.util";
import {formatDistanceToNow} from "date-fns";

export interface ProjectDataTableRowComponentProps {
    projectId: NamespaceProject['id']
}

export const ProjectDataTableRowComponent: React.FC<ProjectDataTableRowComponentProps> = (props) => {

    const {projectId} = props

    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const project = React.useMemo(
        () => projectService.getById(projectId),
        [projectStore, projectId]
    )

    const runtimes = React.useMemo(
        () => project?.runtimes?.nodes?.map(
            runtime => runtimeService.getById(runtime?.id)
        ),
        [runtimeStore, project]
    )

    const primaryRuntime = React.useMemo(
        () => runtimes?.find(
            runtime => runtime?.id === project?.primaryRuntime?.id
        ),
        [runtimes, project]
    )

    return <>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Avatar size={32}
                            color={hashToColor("project")}
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
                <Text hierarchy={"tertiary"}>
                    Updated {formatDistanceToNow(project?.updatedAt!)} ago
                </Text>
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Text hierarchy={"tertiary"}>
                    {project?.flows?.count ?? 0}{" "}
                    flows
                </Text>
                <Text hierarchy={"tertiary"}>
                    {project?.runtimes?.count ?? 0}{" "}
                    assigned runtimes
                </Text>
            </Flex>
        </DataTableColumn>
    </>
}