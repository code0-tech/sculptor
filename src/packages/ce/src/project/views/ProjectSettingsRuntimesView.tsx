"use client"

import React from "react"
import {Button, DRuntimeCard, DRuntimeList, Flex, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {useParams} from "next/navigation";
import {ProjectService} from "@edition/project/services/Project.service";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";

export const ProjectSettingsRuntimesView: React.FC = () => {

    const params = useParams()
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const projectId = params.projectId as any as number

    const project = React.useMemo(
        () => projectService.getById(`gid://sagittarius/NamespaceProject/${projectId}`),
        [projectStore, projectId]
    )

    return <TabContent value={"access"}>
        <Flex justify={"space-between"} align={"start"}>
            <Text size={"xl"} hierarchy={"primary"}>Runtimes</Text>
            <Button color={"success"}>
                Save changes
            </Button>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Text size={"md"} hierarchy={"secondary"}>Primary Runtime</Text>
        <Spacing spacing={"xl"}/>
        <DRuntimeCard runtimeId={project?.primaryRuntime?.id}/>
        <Spacing spacing={"xl"}/>
        <Text size={"md"} hierarchy={"secondary"}>All Runtimes</Text>
        <Spacing spacing={"xl"}/>
        <DRuntimeList filter={(runtime) => {
            return project?.runtimes?.nodes?.map(runtime => runtime?.id).includes(runtime?.id) ?? false
        }}/>

    </TabContent>
}