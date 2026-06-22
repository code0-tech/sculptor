"use client"

import {Button, Flex,} from "@code0-tech/pictor";
import React from "react";
import {IconFile, IconPlayerPlay} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowBuilderComponent} from "@edition/flow/components/builder/FlowBuilderComponent";
import {FunctionFilesComponent} from "@edition/function/components/files/FunctionFilesComponent";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {FlowExecutionResultView} from "@edition/flow/views/FlowExecutionResultView";
import {useHotkeys} from "react-hotkeys-hook";
import {Node, useReactFlow} from "@xyflow/react";

export default function Page() {

    const params = useParams()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectIndex = params.projectId as any as number
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const [tab, setTab] = React.useState<string | undefined>(undefined);
    const reactFlow = useReactFlow()

    useHotkeys('shift+1', (keyboardEvent) => {
        setTab(prevState => prevState === "file" ? undefined : "file")
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    }, [])

    React.useEffect(() => {

        const localSelectedNode = reactFlow.getNodes().filter((node) => node.selected)[0] as Node | undefined
        if (!localSelectedNode) return
        setTimeout(() => {
            reactFlow.fitView({
                nodes: [{id: localSelectedNode.id}],
                maxZoom: reactFlow.getZoom(),
                minZoom: 1,
            });
        }, 100)
    }, [tab, reactFlow])

    return <ResizablePanel id={"2"}>
        <Layout layoutGap={0} showLayoutSplitter={false} rightContent={
            <Flex pl={0.7} style={{flexDirection: "column", gap: "0.7rem"}}>
                <Button aria-selected={tab === "file"}
                        onClick={() => setTab(prevState => prevState === "file" ? undefined : "file")} variant={"none"}
                        paddingSize={"xs"}>
                    <IconFile size={16}/>
                </Button>
                <Button aria-selected={tab === "execution"}
                        onClick={() => setTab(prevState => prevState === "execution" ? undefined : "execution")}
                        variant={"none"}
                        paddingSize={"xs"}>
                    <IconPlayerPlay size={16}/>
                </Button>
            </Flex>
        }>
            <ResizablePanelGroup orientation={"horizontal"} key={flowIndex}>
                <ResizablePanel id={"2"}>
                    <ResizablePanelGroup orientation={"vertical"}>
                        <ResizablePanel id={"1"} color={"primary"}
                                        style={{
                                            ...(tab === "execution" ? {borderRadius: "1rem"} : {
                                                borderTopLeftRadius: "1rem",
                                                borderTopRightRadius: "1rem"
                                            })
                                        }}>
                            <FlowBuilderComponent flowId={flowId} namespaceId={namespaceId} projectId={projectId}/>
                        </ResizablePanel>
                        {
                            tab === "execution" && (
                                <>
                                    <ResizableHandle/>
                                    <ResizablePanel id={"2"} color={"primary"}
                                                    style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                                        <FlowExecutionResultView/>
                                    </ResizablePanel>
                                </>
                            )
                        }
                    </ResizablePanelGroup>
                </ResizablePanel>
                {tab === "file" && (
                    <>
                        <ResizableHandle/>
                        <ResizablePanel id={"3"} defaultSize={"40%"} color={"primary"}
                                        style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                            <FunctionFilesComponent flowId={flowId} namespaceId={undefined}
                                                    projectId={undefined}/>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </Layout>
    </ResizablePanel>
}