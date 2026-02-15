"use client"

import {
    Button,
    DFlow,
    DFlowTabs,
    DLayout,
    DResizableHandle,
    DResizablePanel,
    DResizablePanelGroup,
    Flex,
    Text
} from "@code0-tech/pictor";
import React from "react";
import {IconDatabase, IconFile, IconMessageChatbot} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {Flow} from "@code0-tech/sagittarius-graphql-types";

export default function Page() {

    const params = useParams()

    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const [show, setShow] = React.useState(false);

    return <DResizablePanel id={"2"}>
        <DLayout layoutGap={0} showLayoutSplitter={false} rightContent={
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
            <DResizablePanelGroup orientation={"horizontal"} key={flowIndex}>
                <DResizablePanel id={"2"} color={"primary"} style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                    <DFlow flowId={flowId} namespaceId={undefined} projectId={undefined}/>
                </DResizablePanel>
                {show && (
                    <>
                        <DResizableHandle/>
                        <DResizablePanel id={"3"} defaultSize={"25%"} color={"primary"} style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                            <DFlowTabs flowId={flowId} namespaceId={undefined}
                                       projectId={undefined}/>
                        </DResizablePanel>
                    </>
                )}
            </DResizablePanelGroup>
        </DLayout>
    </DResizablePanel>
}