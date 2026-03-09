"use client"

import React from "react";
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";

interface ApplicationLayoutProps {
    children: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children}) => {

    return <ResizablePanelGroup orientation={"horizontal"}>
        <SidebarComponent title={"Explorer"} id={"1"}>
            <FlowFolderView/>
        </SidebarComponent>
        <ResizableHandle/>
        {children}
    </ResizablePanelGroup>
}

export default ApplicationLayout
