"use client"

import React from "react";
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";
import {ResizableHandle, ResizablePanelGroup} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";
import {WorkerProvider} from "@edition/flow/components/FlowWorkerProvider";

interface ApplicationLayoutProps {
    children: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children}) => {

    return <ResizablePanelGroup orientation={"horizontal"}>
        <SidebarComponent title={"Explorer"} id={"1"}>
            <FlowFolderView/>
        </SidebarComponent>
        <ResizableHandle/>
        <WorkerProvider>
            {children}
        </WorkerProvider>
    </ResizablePanelGroup>
}

export default ApplicationLayout
