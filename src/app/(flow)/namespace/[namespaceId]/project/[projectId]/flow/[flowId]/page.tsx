"use client"

import {
    Button,
    Flex,
} from "@code0-tech/pictor";
import React from "react";
import {IconDatabase, IconFile, IconMessageChatbot} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {Flow} from "@code0-tech/sagittarius-graphql-types";
import {FlowBuilderComponent} from "@edition/flow/components/builder/FlowBuilderComponent";
import {FunctionFiles} from "@edition/function/components/FunctionFiles";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";

export default function Page() {

    const params = useParams()

    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const [show, setShow] = React.useState(false);

    return <ResizablePanel id={"2"}>
        <Layout layoutGap={0} showLayoutSplitter={false} rightContent={
            <Flex pl={0.7} style={{flexDirection: "column", gap: "0.7rem"}}>
                <Button aria-selected={show} onClick={() => setShow(prevState => !prevState)} variant={"none"}
                        paddingSize={"xs"}>
                    <IconFile size={16}/>
                </Button>
                <Button variant={"none"} paddingSize={"xs"}>
                    <IconDatabase size={16}/>
                </Button>
                <Button variant={"none"} paddingSize={"xs"}>
                    <IconMessageChatbot size={16}/>
                </Button>
            </Flex>
        }>
            <ResizablePanelGroup orientation={"horizontal"} key={flowIndex}>
                <ResizablePanel id={"2"} color={"primary"} style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                    <FlowBuilderComponent flowId={flowId} namespaceId={undefined} projectId={undefined}/>
                </ResizablePanel>
                {show && (
                    <>
                        <ResizableHandle/>
                        <ResizablePanel id={"3"} defaultSize={"25%"} color={"primary"} style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                            <FunctionFiles flowId={flowId} namespaceId={undefined}
                                       projectId={undefined}/>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </Layout>
    </ResizablePanel>
}