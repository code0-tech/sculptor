import React from "react";
import {
    FlowFolderContextMenuComponentGroupData,
    FlowFolderContextMenuComponentItemData
} from "./folder/FlowFolderContextMenuComponent";
import {Flow} from "@code0-tech/sagittarius-graphql-types";
import {
    Badge,
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    Text
} from "@code0-tech/pictor";

export interface FlowDeleteDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    contextData: FlowFolderContextMenuComponentGroupData | FlowFolderContextMenuComponentItemData
    onDelete?: (flow: Flow) => void
}

export const FlowDeleteDialogComponent: React.FC<FlowDeleteDialogComponentProps> = (props) => {

    const {open} = props

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(open)

    React.useEffect(() => {
        setDeleteDialogOpen(open)
    }, [open])

    return <Dialog open={deleteDialogOpen} onOpenChange={(open) => props.onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent autoFocus showCloseButton
                           title={props.contextData.type == "item" ? "Remove flow" : "Remove folder"}>
                <Text size={"md"} hierarchy={"secondary"}>
                    {props.contextData.type == "item" ? "Are you sure you want to remove flow" : "Are you sure you want to remove folder"} {" "}
                    <Badge color={"info"}>
                        <Text size={"md"} style={{color: "inherit"}}>{props.contextData.name}</Text>
                    </Badge> {" "}
                    {props.contextData.type == "folder" ? ", all flows and sub-folders inside " : ""}from the this
                    project?
                </Text>
                <Flex justify={"space-between"} align={"center"}>
                    <DialogClose asChild>
                        <Button color={"secondary"}>No, go back!</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button color={"error"} onClick={() => {
                            if (props.contextData.type === "item") {
                                props.onDelete?.(props.contextData.flow)
                            } else if (props.contextData.type === "folder") {
                                props.contextData.flow.forEach(flow => {
                                    props.onDelete?.(flow)
                                })
                            }
                        }}>Yes, remove!</Button>
                    </DialogClose>
                </Flex>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}