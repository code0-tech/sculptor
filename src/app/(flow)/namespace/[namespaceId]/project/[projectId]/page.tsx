"use client"

import {
    Button,
    Col,
    DResizablePanel,
    Flex,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text
} from "@code0-tech/pictor";
import React from "react";
import Link from "next/link";
import {useParams} from "next/navigation";

export default function Page() {

    const params = useParams()

    const namespaceIndex = params?.namespaceId as any as number

    return <DResizablePanel id={"2"} color={"primary"} style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
        <ScrollArea h={"100%"} w={"100%"}>
            <ScrollAreaViewport style={{paddingTop: "40vh"}}>
                <Flex mih={"100%"} miw={"100%"} pos={"relative"} align={"start"}
                      justify={"center"}>
                    <Col xs={4}>
                        <Text size={"xl"} hierarchy={"primary"}>Create or select a flow</Text>
                        <Spacing spacing={"xs"}/>
                        <Text size={"md"} hierarchy={"tertiary"}>
                            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
                            invidunt ut
                            labore et dolore magna aliquyam erat, sed diam voluptua.
                        </Text>
                        <Spacing spacing={"xl"}/>
                        <Flex style={{gap: "0.7rem"}}>
                            <Link href={`/namespace/${namespaceIndex}/projects`}>
                                <Button color={"primary"}>
                                    Go back to project overview
                                </Button>
                            </Link>
                            <Button color={"success"}>
                                Create new flow
                            </Button>
                        </Flex>
                        <Spacing spacing={"xl"}/>
                        <Text size={"xl"} hierarchy={"primary"}>Or start from a template</Text>
                    </Col>
                </Flex>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation={"vertical"}>
                <ScrollAreaThumb/>
            </ScrollAreaScrollbar>
        </ScrollArea>
        <div style={{
            backgroundImage: "url(/CodeZero_Rainbow.png)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -1,
        }}/>
    </DResizablePanel>
}