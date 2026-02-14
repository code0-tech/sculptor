"use client"

import React from "react";
import {DResizableHandle, DResizablePanel, DResizablePanelGroup} from "@code0-tech/pictor";
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";

interface ApplicationLayoutProps {
    children: React.ReactNode
    bar: React.ReactNode
    tab: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, bar, tab}) => {

    return <DResizablePanelGroup orientation={"horizontal"}>
        <DResizablePanel id={"1"} defaultSize={"25%"}>
            <FlowFolderView/>
        </DResizablePanel>
        <DResizableHandle/>
        {children}
    </DResizablePanelGroup>
}

export default ApplicationLayout
