"use client"

import React from "react";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {ResizableHandle, ResizablePanel} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {ResizablePanelGroup} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {FlowBuilderComponent} from "@edition/flow/components/builder/FlowBuilderComponent";
import {FunctionFilesComponent} from "@edition/function/components/files/FunctionFilesComponent";
import "./PlaygroundFlowView.scss";

export interface PlaygroundFlowViewProps {
    flowIndex: number
    readonly: boolean
}

export const PlaygroundFlowView: React.FC<PlaygroundFlowViewProps> = ({flowIndex, readonly}) => {

    const namespaceId = "gid://sagittarius/Namespace/undefined" as Namespace['id']
    const projectId = "gid://sagittarius/NamespaceProject/undefined" as NamespaceProject['id']
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    if (!mounted) return <ResizablePanel id={"playground"}/>

    return <ResizablePanel id={"playground"}>
        <ResizablePanelGroup orientation={"horizontal"} key={flowIndex}>
            <ResizablePanel id={"canvas"} color={"primary"} style={{borderRadius: "1rem"}}>
                <div className={`playground-canvas playground-canvas--${readonly ? "readonly" : "edit"}`}>
                    <FlowBuilderComponent flowId={flowId} namespaceId={namespaceId} projectId={projectId}/>
                </div>
            </ResizablePanel>
            {!readonly ? (
                <>
                    <ResizableHandle/>
                    <ResizablePanel id={"files"} defaultSize={"40%"} color={"primary"} style={{borderRadius: "1rem"}}>
                        <FunctionFilesComponent flowId={flowId} namespaceId={namespaceId} projectId={projectId}/>
                    </ResizablePanel>
                </>
            ) : null}
        </ResizablePanelGroup>
    </ResizablePanel>
}
