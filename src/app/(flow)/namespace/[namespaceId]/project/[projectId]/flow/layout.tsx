"use client"

import React from "react";
import {DResizableHandle, DResizablePanel, DResizablePanelGroup} from "@code0-tech/pictor";
import {FolderView} from "@edition/flow/views/FolderView";

interface ApplicationLayoutProps {
    children: React.ReactNode
    bar: React.ReactNode
    tab: React.ReactNode
}

const ApplicationLayout: React.FC<ApplicationLayoutProps> = ({children, bar, tab}) => {

    return <DResizablePanelGroup orientation={"horizontal"}>
        <DResizablePanel id={"1"} defaultSize={"25%"}>
            <FolderView/>
        </DResizablePanel>
        <DResizableHandle/>
        {children}
    </DResizablePanelGroup>
}

export default ApplicationLayout
