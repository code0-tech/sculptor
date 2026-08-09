"use client"

import React, {startTransition} from "react";
import {
    Avatar,
    Badge,
    Button,
    ButtonGroup,
    Flex,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuSeparator,
    MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconPlus} from "@tabler/icons-react";
import {useParams, useRouter} from "next/navigation";
import {Namespace, NamespaceProject, Runtime} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {RuntimeProjectDataTableComponent} from "@edition/runtime/components/RuntimeProjectDataTableComponent";

export const ProjectSettingsAssignedServersView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectStore, projectId, namespaceId]
    )

    const availableRuntimes = React.useMemo(() => {
        const globalRuntimes = runtimeService.values().filter(runtime => !runtime?.namespace?.id)
        const namespaceRuntimes = runtimeService.values({namespaceId})
        return [...globalRuntimes, ...namespaceRuntimes]
    }, [runtimeStore, namespaceId])

    const assignedCount = React.useMemo(
        () => project?.runtimes?.nodes?.length ?? 0,
        [project]
    )

    const assignRuntime = React.useCallback((runtimeId: Runtime['id']) => {
        const runtimeIds = project?.runtimes?.nodes?.map(r => r?.id!) ?? []

        if (!runtimeId) return
        if (runtimeIds.includes(runtimeId)) return

        startTransition(() => {
            projectService.projectAssignRuntimes({
                runtimeIds: [...runtimeIds, runtimeId],
                namespaceProjectId: projectId
            })
        })
    }, [projectService, projectId, project])

    return <TabContent value={"servers"} style={{overflow: "hidden"}}>
        <Flex justify={"space-between"} align={"center"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Assigned servers</Text>
                <Badge color={"secondary"}>{assignedCount}</Badge>
            </Flex>
            <ButtonGroup>
                <Menu>
                    <MenuTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"}>
                            <IconPlus size={13}/>
                        </Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent align={"end"} side={"bottom"} sideOffset={8}>
                            {availableRuntimes.map((runtime, index) => (
                                <React.Fragment key={runtime.id}>
                                    <MenuItem onSelect={() => assignRuntime(runtime.id)}>
                                        <Flex align={"center"} style={{gap: "0.7rem"}}>
                                            <Avatar size={32}
                                                    color={hashToColor(runtime?.name ?? "", 0, 180)}
                                                    identifier={runtime?.name ?? ""}/>
                                            <Flex align={"center"} justify={"space-between"} w={"100%"}
                                                  style={{gap: "0.7rem"}}>
                                                <Text hierarchy={"primary"}>{runtime?.name}</Text>
                                                <Badge color={runtime?.status?.status === "RUNNING" ? "success" : "error"}
                                                       border>
                                                    <Text style={{color: "inherit"}}>{runtime?.status?.status}</Text>
                                                </Badge>
                                            </Flex>
                                        </Flex>
                                    </MenuItem>
                                    {index < availableRuntimes.length - 1 && <MenuSeparator/>}
                                </React.Fragment>
                            ))}
                        </MenuContent>
                    </MenuPortal>
                </Menu>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            The runtimes assigned to this project. Assigned runtimes are the environments where this project's flows run.
        </Text>
        <Spacing spacing={"md"}/>
        <RuntimeProjectDataTableComponent projectId={projectId}
                                          onSelect={(runtime) => {
                                              const number = runtime?.id?.match(/Runtime\/(\d+)$/)?.[1]
                                              if (number) router.push(`/namespace/${namespaceIndex}/runtimes/${number}/settings`)
                                          }}/>
    </TabContent>
}
