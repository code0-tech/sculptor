import React from "react";
import {FlowFolderContextMenuComponentGroupData, FlowFolderContextMenuComponentItemData} from "./FlowFolderContextMenuComponent";
import {Flow} from "@code0-tech/sagittarius-graphql-types";
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    useForm
} from "@code0-tech/pictor";
import {FlowNameInputComponent} from "@edition/flow/components/FlowNameInputComponent";

export interface FlowRenameDialogComponentProps {
    contextData: FlowFolderContextMenuComponentGroupData | FlowFolderContextMenuComponentItemData
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onRename?: (flow: Flow, newName: string) => void
}

export const FlowRenameDialogComponent: React.FC<FlowRenameDialogComponentProps> = (props) => {
    const {open} = props

    const [renameDialogOpen, setRenameDialogOpen] = React.useState(open)
    const initialValues = React.useMemo(() => ({
        path: props.contextData.name
    }), [])

    React.useEffect(() => {
        setRenameDialogOpen(open)
    }, [open])

    const [inputs, validate] = useForm({
        initialValues: initialValues,
        validate: {
            path: (value) => {
                return null
            }
        },
        onSubmit: (values) => {
            if (props.contextData.type === "item") {
                props.onRename?.(props.contextData.flow, values.path)
            } else if (props.contextData.type === "folder") {
                props.contextData.flow.forEach(flow => {
                    const newName = flow.name?.replace(props.contextData.name, values.path) ?? flow.name
                    props.onRename?.(flow, newName!)
                })
            }
        }
    })

    return <Dialog open={renameDialogOpen} onOpenChange={(open) => {
        props.onOpenChange?.(open)
    }}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent autoFocus showCloseButton
                           title={props.contextData.type == "item" ? "Rename flow" : "Rename folder"}>
                <div>
                    <FlowNameInputComponent
                        description={"You can choose a new name here and only use alphanumeric names."}
                        title={props.contextData.type == "item" ? "Name of the flow" : "Name of the folder"}
                        {...inputs.getInputProps("path")}/>
                </div>
                <Flex justify={"space-between"} align={"center"}>
                    <DialogClose asChild>
                        <Button color={"secondary"}>No, go back!</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button color={"success"} onClick={validate}>Yes, save!</Button>
                    </DialogClose>
                </Flex>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}