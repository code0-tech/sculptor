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

    const {children} = props

    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)

    const flowTypes = React.useMemo(() => flowTypeService.values(), [flowTypeStore])

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
                                    {flowType.names!![0]?.content ?? flowType.id}
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