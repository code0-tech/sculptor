"use client"

import React, {startTransition} from "react"
import {
    Button,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {useParams} from "next/navigation";
import {RuntimeProjectDataTableComponent} from "@edition/runtime/components/RuntimeProjectDataTableComponent";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {Runtime} from "@code0-tech/sagittarius-graphql-types";

export const ProjectSettingsRuntimesView: React.FC = () => {

    const params = useParams()
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const projectId = params.projectId as any as number
    const namespaceId = params.namespaceId as any as number

    const availableRuntimes = React.useMemo(
        () => {
            const globalRuntimes = runtimeService.values().filter(runtime => !runtime?.namespace?.id)
            const namespaceRuntimes = runtimeService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceId}`})
            return [...globalRuntimes, ...namespaceRuntimes]
        },
        [runtimeStore, projectId]
    )

    const project = React.useMemo(
        () => projectService.getById(`gid://sagittarius/NamespaceProject/${projectId}`),
        [projectStore, projectId]
    )

    const assignRuntime = React.useCallback((runtimeId: Runtime['id']) => {
        const runtimeIds = project?.runtimes?.nodes?.map(r => r?.id!) ?? []

        if (!runtimeId) return
        if (runtimeIds.includes(runtimeId)) return

        startTransition(() => {
            projectService.projectAssignRuntimes({
                runtimeIds: [...runtimeIds, runtimeId],
                namespaceProjectId: `gid://sagittarius/NamespaceProject/${projectId}`
            })
        })
    }, [projectService, projectId, project])

    return <TabContent value={"access"}>
        <Flex justify={"space-between"} align={"start"}>
            <Text size={"xl"} hierarchy={"primary"}>Runtimes</Text>
            <Menu>
                <MenuTrigger asChild>
                    <Button color={"success"}>
                        Add runtime
                    </Button>
                </MenuTrigger>
                <MenuPortal>
                    <MenuContent align={"end"} side={"bottom"} sideOffset={8}>
                        {availableRuntimes.map(runtime => {
                            return <MenuItem key={runtime.id} onSelect={() => assignRuntime(runtime.id)}>
                                <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                    <Text size={"md"} hierarchy={"primary"}>
                                        {runtime?.name}
                                    </Text>
                                    <Text>
                                        {runtime?.description}
                                    </Text>
                                </Flex>
                            </MenuItem>
                        })}
                    </MenuContent>
                </MenuPortal>
            </Menu>
        </Flex>
        <Spacing spacing={"xl"}/>
        <RuntimeProjectDataTableComponent projectId={`gid://sagittarius/NamespaceProject/${projectId}`}/>

    </TabContent>
}