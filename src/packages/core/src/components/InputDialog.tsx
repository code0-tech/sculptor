"use client"

import React from "react";
import {
    Badge,
    Button,
    Card,
    Dialog, DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
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
                    <Card color={"primary"} paddingSize={"md"} h={"100%"} w={"100%"}>
                        <div style={{maxWidth: "75%", margin: "0 auto", padding: "4rem 1rem"}}>
                            {children!}
                        </div>
                    </Card>
                </Layout>
            </DialogContent>
        </DialogPortal>
    </Dialog>

}