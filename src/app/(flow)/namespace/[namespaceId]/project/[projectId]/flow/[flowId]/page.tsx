"use client"

import {
    Button,
    Card,
    Flex,
    Gantt,
    getRelativeValue,
    hashToColor, Spacing, Text,
    Tooltip, TooltipContent, TooltipPortal,
    TooltipTrigger,
    withAlpha,
} from "@code0-tech/pictor";
import React from "react";
import {
    IconArrowRampRight2,
    IconBrandDiscord, IconBrandTeams,
    IconDatabase,
    IconFile,
    IconPlayerPlay,
    IconTextGrammar
} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {Flow} from "@code0-tech/sagittarius-graphql-types";
import {FlowBuilderComponent} from "@edition/flow/components/builder/FlowBuilderComponent";
import {FunctionFilesComponent} from "@edition/function/components/files/FunctionFilesComponent";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {Editor} from "@code0-tech/pictor/dist/components/editor/Editor";
import {FlowExecutionResultView} from "@edition/flow/views/FlowExecutionResultView";

export default function Page() {

    const params = useParams()

    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const [tab, setTab] = React.useState<string | undefined>(undefined);

    return <ResizablePanel id={"2"}>
        <Layout layoutGap={0} showLayoutSplitter={false} rightContent={
            <Flex pl={0.7} style={{flexDirection: "column", gap: "0.7rem"}}>
                <Button aria-selected={tab === "file"} onClick={() => setTab("file")} variant={"none"}
                        paddingSize={"xs"}>
                    <IconFile size={16}/>
                </Button>
                <Button aria-selected={tab === "execution"} onClick={() => setTab("execution")} variant={"none"}
                        paddingSize={"xs"}>
                    <IconPlayerPlay size={16}/>
                </Button>
            </Flex>
        }>
            <ResizablePanelGroup orientation={"horizontal"} key={flowIndex}>
                <ResizablePanel id={"2"}>
                    <ResizablePanelGroup orientation={"vertical"}>
                        <ResizablePanel id={"1"} color={"primary"}
                                        style={{borderRadius: "1rem"}}>
                            <FlowBuilderComponent flowId={flowId} namespaceId={undefined} projectId={undefined}/>
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
                        <ResizablePanel id={"3"} defaultSize={"25%"} color={"primary"}
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