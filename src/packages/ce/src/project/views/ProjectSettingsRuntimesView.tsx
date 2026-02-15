"use client"

import React, {startTransition} from "react"
import {
    Avatar,
    Button,
    Flex,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuSeparator,
    MenuTrigger,
    Spacing,
    Badge,
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
import {formatDistanceToNow} from "date-fns";

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
                        {availableRuntimes.map((runtime, index) => {
                            return <>
                                <MenuItem key={runtime.id} onSelect={() => assignRuntime(runtime.id)}>
                                    <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                        <Flex align={"center"} style={{gap: "0.7rem"}}>
                                            <Avatar size={32}
                                                    color={hashToColor(runtime?.name ?? "", 0, 180)}
                                                    identifier={runtime?.name ?? ""}/>
                                            <Flex justify={"space-between"} align={"center"} style={{gap: "0.7rem"}}>
                                                <Text hierarchy={"primary"}>
                                                    {runtime?.name}
                                                </Text>
                                                <Flex justify={"end"} w={"100%"}>
                                                    <Badge color={runtime?.status === "CONNECTED" ? "success" : "error"}
                                                           border>
                                                        <Text style={{color: "inherit"}}>{runtime?.status}</Text>
                                                    </Badge>
                                                </Flex>

                                            </Flex>
                                        </Flex>
                                        <Text hierarchy={"tertiary"}>
                                            Updated {formatDistanceToNow(runtime?.updatedAt!)} ago
                                        </Text>
                                    </Flex>
                                </MenuItem>
                                {index < availableRuntimes.length - 1 ?
                                    <MenuSeparator key={`${runtime.id}-separator`}/> : null}
                            </>
                        })}
                    </MenuContent>
                </MenuPortal>
            </Menu>
        </Flex>
        <Spacing spacing={"xl"}/>
        <RuntimeProjectDataTableComponent projectId={`gid://sagittarius/NamespaceProject/${projectId}`}/>

    </TabContent>
}