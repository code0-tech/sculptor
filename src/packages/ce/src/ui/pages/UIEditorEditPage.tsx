import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import { UIEditorComponent } from "@edition/ui/components/UIEditorComponent";
import { UIEditorControlPanelView } from "@edition/ui/views/UIEditorControlPanelView";
import { Puck } from "@puckeditor/core";
import React from "react";
import { UIEditorSidebarView } from "../views/UIEditorSidebarView";

export const UIEditorEditPage: React.FC = () => {
    return (
        <ResizablePanelGroup>
            <UIEditorSidebarView/>
            <ResizableHandle/>
            <ResizablePanel id={"2"}>
                <UIEditorComponent>
                    <ResizablePanelGroup orientation={"horizontal"}>
                        <ResizablePanel
                            id={"3"}
                            color={"primary"}
                            style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}
                        >
                            {/*<UIEditorHistoryPanelView/>*/}
                            <UIEditorControlPanelView/>
                            <Puck.Preview/>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel
                            id={"4"}
                            defaultSize={"25%"}
                            color={"primary"}
                            style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}
                        >
                            <Puck.Fields />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </UIEditorComponent>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
