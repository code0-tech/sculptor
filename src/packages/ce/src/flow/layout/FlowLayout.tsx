import React from "react";
import {ResizableHandle, ResizablePanelGroup} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";
import {WorkerProvider} from "@edition/flow/components/FlowWorkerProvider";

interface FlowLayoutProps {
    children: React.ReactNode
}

export const FlowLayout: React.FC<FlowLayoutProps> = ({children}) => {

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