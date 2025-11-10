"use client"

import {Badge, Button, DLayout, Flex, InputLabel, Spacing, SwitchInput, Text} from "@code0-tech/pictor";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconGavel, IconSettings} from "@tabler/icons-react";
import * as process from "node:process";

export default function Page() {

    return <Tab orientation={"vertical"} defaultValue={"restrictions"}>
        <DLayout leftContent={
            <TabList>
                <InputLabel>Application</InputLabel>
                <Spacing spacing={"xs"}/>
                <TabTrigger value={"general"}>
                    <Button variant={"none"}>
                        <IconSettings size={16}/>
                        General
                    </Button>
                </TabTrigger>
                <TabTrigger value={"restrictions"}>
                    <Button variant={"none"}>
                        <IconGavel size={16}/>
                        Restrictions
                    </Button>
                </TabTrigger>
            </TabList>
        }>
            <>
                <TabContent value={"general"}>
                    <Text size={"xl"} hierarchy={"primary"}>General</Text>
                    <Spacing spacing={"xl"}/>
                    <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                    <Spacing spacing={"xl"}/>
                    <Flex style={{gap: "1.3rem", flexDirection: "column"}}>
                        <Flex justify={"space-between"} align={"center"}>
                            <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                <Text size={"md"} hierarchy={"primary"}>Sculptor version</Text>
                                <Text size={"md"} hierarchy={"tertiary"}>Version of this application</Text>
                            </Flex>
                            <Badge color={"info"}>v0.0.0-mvp.1</Badge>
                        </Flex>
                        <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                        <Flex justify={"space-between"} align={"center"}>
                            <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                <Text size={"md"} hierarchy={"primary"}>Pictor version</Text>
                                <Text size={"md"} hierarchy={"tertiary"}>Version of the UI component library</Text>
                            </Flex>
                            <Badge color={"info"}>{process.env.NEXT_PUBLIC_pictorVersion ?? "v0.0.0-mvp.10"}</Badge>
                        </Flex>
                        <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                        <Flex justify={"space-between"} align={"center"}>
                            <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                <Text size={"md"} hierarchy={"primary"}>Sagittarius version</Text>
                                <Text size={"md"} hierarchy={"tertiary"}>Version of the backend</Text>
                            </Flex>
                            <Badge color={"info"}>2134929721-ee</Badge>
                        </Flex>
                    </Flex>
                </TabContent>
                <TabContent value={"restrictions"}>
                    <Text size={"xl"} hierarchy={"primary"}>Restrictions</Text>
                    <Spacing spacing={"xl"}/>
                    <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                    <Spacing spacing={"xl"}/>
                    <Flex style={{gap: "1.3rem", flexDirection: "column"}}>
                        <Flex justify={"space-between"} align={"center"}>
                            <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                <Text size={"md"} hierarchy={"primary"}>Organization creation</Text>
                                <Text size={"md"} hierarchy={"tertiary"}>Set if organization creation is restricted to
                                    administrators.</Text>
                            </Flex>
                            <SwitchInput w={"40px"}/>
                        </Flex>
                        <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                        <Flex justify={"space-between"} align={"center"}>
                            <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                <Text size={"md"} hierarchy={"primary"}>User registration</Text>
                                <Text size={"md"} hierarchy={"tertiary"}>Set if user registration is enabled.</Text>
                            </Flex>
                            <SwitchInput w={"40px"}/>
                        </Flex>
                    </Flex>

                </TabContent>
            </>
        </DLayout>
    </Tab>
}
