import React from "react";
import {ResizablePanelGroup} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {WorkerProvider} from "@edition/flow/components/FlowWorkerProvider";
import {ReactFlowProvider} from "@xyflow/react";

interface FlowLayoutProps {
    children: React.ReactNode
}

export const FlowLayout: React.FC<FlowLayoutProps> = ({children}) => {

    return <ResizablePanelGroup orientation={"horizontal"}>
        <WorkerProvider>
            <ReactFlowProvider>
                {children}
            </ReactFlowProvider>
        </WorkerProvider>
    </ResizablePanelGroup>
}