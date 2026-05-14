import React from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";
import {UIEditorComponent} from "@edition/ui/components/UIEditorComponent";
import {UIEditorHistoryPanelView} from "@edition/ui/views/UIEditorHistoryPanelView";
import {UIEditorControlPanelView} from "@edition/ui/views/UIEditorControlPanelView";
import {Drawer, Puck} from "@puckeditor/core";

export const UIEditorPage: React.FC = () => {
    return <ResizablePanelGroup>
        <SidebarComponent id={"1"}
                          title={"Project settings"}
                          description={"General settings and restrictions for your Sculptor application. These settings affect all users and organizations within the application."}>
            <></>
        </SidebarComponent>
        <ResizableHandle/>
        <ResizablePanel id={"2"}>
            <UIEditorComponent>
                <ResizablePanelGroup orientation={"horizontal"}>
                    <ResizablePanel id={"3"}
                                    color={"primary"}
                                    style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                        <UIEditorHistoryPanelView/>
                        <UIEditorControlPanelView/>
                        <Puck.Preview/>
                    </ResizablePanel>
                    <ResizableHandle/>
                    <ResizablePanel id={"4"}
                                    defaultSize={"25%"}
                                    color={"primary"}
                                    style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                        <Puck.Fields/>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </UIEditorComponent>
        </ResizablePanel>
    </ResizablePanelGroup>
}