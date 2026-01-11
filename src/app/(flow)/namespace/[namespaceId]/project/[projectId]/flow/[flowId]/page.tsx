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

export default function Page() {
    const [show, setShow] = React.useState(false);

    return <DResizablePanel id={"2"}>
        <DLayout rightContent={
            <Flex p={0.35} style={{flexDirection: "column", gap: "0.7rem"}}>
                <Button onClick={() => setShow(prevState => !prevState)} variant={"none"} paddingSize={"xs"}>
                    <IconFile size={16}/>
                </Button>
                <Button variant={"none"} paddingSize={"xs"}>
                    <IconDatabase size={16}/>
                </Button>
                <Button variant={"none"} paddingSize={"xs"}>
                    <IconMessageChatbot size={16}/>
                </Button>
            </Flex>
        } bottomContent={
            <Flex p={0.35} style={{gap: "0.7rem"}}>
                <Button variant={"none"} paddingSize={"xs"}>
                    <Text>Logbook</Text>
                </Button>
                <Button variant={"none"} paddingSize={"xs"}>
                    <Text>Problems</Text>
                </Button>
            </Flex>
        }>
            <DResizablePanelGroup orientation={"horizontal"}>
                <DResizablePanel id={"2"}>
                    <DFlow flowId={"gid://sagittarius/Flow/1"} namespaceId={undefined} projectId={undefined}/>
                </DResizablePanel>
                {show && (
                    <>
                        <DResizableHandle/>
                        <DResizablePanel id={"3"} defaultSize={25}>
                            <DFlowTabs flowId={"gid://sagittarius/Flow/1"} namespaceId={undefined} projectId={undefined}/>
                        </DResizablePanel>
                    </>
                )}
            </DResizablePanelGroup>
        </DLayout>
    </DResizablePanel>
}