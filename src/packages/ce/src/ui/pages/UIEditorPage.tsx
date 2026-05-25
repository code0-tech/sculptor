import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@code0-tech/pictor"
import { Puck } from "@puckeditor/core"
import { UIEditorSidebarView } from "../views/UIEditorSidebarView"

export const UIEditorPage: React.FC = () => {
    return (
        <ResizablePanelGroup>
            <UIEditorSidebarView/>
            <ResizableHandle/>
            <ResizablePanel id={"2"}>
                <Puck.Preview/>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
