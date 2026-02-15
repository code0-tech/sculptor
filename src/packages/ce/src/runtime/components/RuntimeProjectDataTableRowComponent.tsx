import React, {startTransition} from "react";
import {NamespaceProject, Runtime} from "@code0-tech/sagittarius-graphql-types";
import {
    Avatar,
    Badge,
    Button,
    DataTableColumn,
    Flex,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {formatDistanceToNow} from "date-fns";
import {IconDotsVertical, IconServerSpark, IconX} from "@tabler/icons-react";
import {ProjectService} from "@edition/project/services/Project.service";

export interface RuntimeProjectDataTableRowComponentProps {
    projectId: NamespaceProject['id']
    runtimeId: Runtime['id']
}

export const RuntimeProjectDataTableRowComponent: React.FC<RuntimeProjectDataTableRowComponentProps> = (props) => {

    const {projectId, runtimeId} = props

    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const runtime = React.useMemo(
        () => runtimeService.getById(runtimeId),
        [runtimeStore, runtimeId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId),
        [projectStore, projectId]
    )

    const makePrimary = React.useCallback(() => {
        startTransition(() => {
            projectService.projectUpdate({
                primaryRuntimeId: runtimeId,
                namespaceProjectId: projectId!,
            })
        })
    }, [projectId, runtimeId])

    const removeRuntime = React.useCallback(() => {
        const runtimeIds = project?.runtimes?.nodes?.map(r => r?.id!) ?? []

        startTransition(() => {
            projectService.projectAssignRuntimes({
                runtimeIds: runtimeIds.filter(id => id !== runtimeId),
                namespaceProjectId: projectId!
            })
        })
    }, [projectId, project, runtimeId])

    return <>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Avatar size={32}
                            color={hashToColor(runtime?.name ?? "", 0, 180)}
                            identifier={runtime?.name ?? ""}/>
                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                        <Flex style={{gap: "0.35rem"}}>
                            <Text size={"md"} hierarchy={"primary"}>
                                {runtime?.name}
                            </Text>
                            {project?.primaryRuntime?.id === runtime?.id ?
                                <Badge color={"secondary"}>Primary</Badge> : null}
                        </Flex>
                        <Text>
                            {runtime?.description}
                        </Text>
                    </Flex>
                </Flex>
                <Text hierarchy={"tertiary"}>
                    Updated {formatDistanceToNow(runtime?.updatedAt!)} ago
                </Text>
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            <Badge color={runtime?.status === "CONNECTED" ? "success" : "error"} border>
                <Text style={{color: "inherit"}}>{runtime?.status}</Text>
            </Badge>
        </DataTableColumn>
        <DataTableColumn>
            {
                project?.primaryRuntime?.id !== runtime?.id && (
                    <Menu>
                        <MenuTrigger asChild>
                            <Button color="secondary">
                                <IconDotsVertical size={16}/>
                            </Button>
                        </MenuTrigger>
                        <MenuPortal>
                            <MenuContent align={"end"} side={"bottom"} sideOffset={8}>
                                <MenuItem onSelect={removeRuntime}>
                                    <IconX size={16}/>
                                    <Text>Remove runtime</Text>
                                </MenuItem>
                                <MenuItem onSelect={makePrimary}>
                                    <IconServerSpark size={16}/>
                                    <Text>Make primary</Text>
                                </MenuItem>
                            </MenuContent>
                        </MenuPortal>
                    </Menu>
                )
            }
        </DataTableColumn>
    </>
}