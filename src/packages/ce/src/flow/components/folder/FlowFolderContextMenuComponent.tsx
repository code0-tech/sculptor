import {FlowFolderComponentProps} from "./FlowFolderComponent";
import React from "react";
import {IconChevronRight, IconEdit, IconTrash} from "@tabler/icons-react";
import {Flow} from "@code0-tech/sagittarius-graphql-types";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuPortal,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger
} from "@code0-tech/pictor/dist/components/context-menu/ContextMenu";
import {Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {FALLBACK_FLOW_TYPE_NAME} from "@core/util/fallback-translations";

export interface FlowFolderContextMenuComponentGroupData {
    name: string
    flow: Flow[]
    type: "folder"
}

export interface FlowFolderContextMenuComponentItemData {
    name: string
    flow: Flow
    type: "item"
}

export interface FlowFolderContextMenuComponentProps extends FlowFolderComponentProps {
    children: React.ReactNode
    contextData?: FlowFolderContextMenuComponentGroupData | FlowFolderContextMenuComponentItemData
}

export const FlowFolderContextMenuComponent: React.FC<FlowFolderContextMenuComponentProps> = (props) => {

    const {children, namespaceId, projectId} = props

    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectStore, projectId, namespaceId]
    )

    // Scope the flow types to this project's primary runtime, otherwise the store
    // still holds the previously visited project's flow types. Without a runtime
    // there is nothing to create, and values() would fall back to the whole store.
    const flowTypes = React.useMemo(() => {
        const runtimeId = project?.primaryRuntime?.id
        if (!runtimeId) return []
        return flowTypeService.values({runtimeId, projectId, namespaceId})
    }, [flowTypeStore, project, projectId, namespaceId])

    return <>
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuPortal>
                <ContextMenuContent>
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}} w={"100%"}>
                                <Text>Create new flow</Text>
                                <IconChevronRight size={12}/>
                            </Flex>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                            <ContextMenuLabel>Flow types</ContextMenuLabel>
                            {flowTypes.map(flowType => {
                                return <ContextMenuItem key={flowType.id} onSelect={() => {
                                    props.onCreate?.(flowType.id)
                                }}>
                                    {flowType.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_NAME}
                                </ContextMenuItem>
                            })}
                        </ContextMenuSubContent>
                        {props.contextData ? (
                            <>
                                <ContextMenuSeparator/>
                                <ContextMenuItem disabled onSelect={() => props.onRename?.(props.contextData!)}>
                                    <IconEdit size={13}/>
                                    <Text>Rename</Text>
                                </ContextMenuItem>
                                <ContextMenuItem onSelect={() => props.onDelete?.(props.contextData!)}>
                                    <IconTrash size={13}/>
                                    <Text>Delete</Text>
                                </ContextMenuItem>
                            </>
                        ) : null}
                    </ContextMenuSub>
                </ContextMenuContent>
            </ContextMenuPortal>
        </ContextMenu>
    </>
}