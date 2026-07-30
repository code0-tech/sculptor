"use client"

import React from "react";
import {
    Button,
    Card,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {IconArrowLeft} from "@tabler/icons-react";

export interface InputDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title?: string
    description?: string
    children?: React.ReactElement[]
}

export const InputDialog: React.FC<InputDialogProps> = (props) => {

    const {open, onOpenChange, title, description, children} = props

    return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent style={{padding: "2px"}}
                           w={"75%"} h={"75%"}
                           autoFocus
                           tabIndex={-1}
                           showCloseButton={false}>
                <Layout layoutGap={0} showLayoutSplitter={false} leftContent={
                    <div style={{
                        padding: "2.6rem",
                        height: "100%",
                        maxWidth: "300px",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        <Text fz={2} hierarchy={"primary"}>
                            {title}
                        </Text>
                        <Spacing spacing={"xs"}/>
                        <Text maw={"250px"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                            {description}
                        </Text>
                        <DialogClose asChild style={{marginTop: "auto"}}>
                            <Button paddingSize={"xxs"} w={"100%"} variant={"none"} justify={"start"}>
                                <IconArrowLeft size={16}/>
                                <Text size={"md"}>
                                    Go back
                                </Text>
                            </Button>
                        </DialogClose>
                    </div>
                }>
                    <Card color={"primary"} p={"0"} paddingSize={"md"} h={"100%"} w={"100%"}>
                        <ScrollArea h={"100%"} type={"scroll"}>
                            <ScrollAreaViewport>
                                <div style={{maxWidth: "75%", margin: "0 auto", padding: "4rem 1rem"}}>
                                    {children!}
                                </div>
                            </ScrollAreaViewport>
                            <ScrollAreaScrollbar orientation={"vertical"}>
                                <ScrollAreaThumb/>
                            </ScrollAreaScrollbar>
                        </ScrollArea>
                    </Card>
                </Layout>
            </DialogContent>
        </DialogPortal>
    </Dialog>

}