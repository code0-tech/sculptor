"use client"

import React from "react";
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";

interface ApplicationLayoutProps {
    children: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children}) => {

    return <ResizablePanelGroup orientation={"horizontal"}>
        <ResizablePanel id={"1"} defaultSize={"25%"}>
            <FlowFolderView/>
        </ResizablePanel>
        <ResizableHandle/>
        {children}
    </ResizablePanelGroup>
}

export default ApplicationLayout
