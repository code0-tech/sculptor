"use client"

import {
    Button,
    Card,
    DResizableHandle,
    DResizablePanel,
    DResizablePanelGroup,
    Flex,
    Spacing,
    Text
} from "@code0-tech/pictor";
import {IconLayoutSidebar} from "@tabler/icons-react";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import React from "react";

export default function Page() {
    return <Tab orientation={"vertical"} defaultValue={"general"} h={"100%"}>
        <DResizablePanelGroup>
            <DResizablePanel id={"1"} defaultSize={"20%"} collapsedSize={"0%"}
                             collapsible minSize={"10%"} style={{textWrap: "nowrap"}}>
                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                    <Flex style={{gap: "0.7rem"}} align={"center"} justify={"space-between"}>
                        <Text size={"md"} hierarchy={"secondary"}>Project settings</Text>

                        <Button variant={"none"} paddingSize={"xxs"}>
                            <IconLayoutSidebar size={16}/>
                        </Button>
                    </Flex>
                    <Text size={"sm"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                        General settings and restrictions for your Sculptor application. These settings affect all users
                        and organizations within the application.
                    </Text>
                    <TabList>
                        <TabTrigger value={"general"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>General adjustments</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"access"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>How to connect</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"delete"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>Delete runtime forever</Text>
                            </Button>
                        </TabTrigger>
                    </TabList>
                </Flex>
            </DResizablePanel>
            <DResizableHandle/>
            <DResizablePanel id={"2"} color={"primary"} p={1}
                             style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                <>
                    <TabContent value={"general"}>
                        <Flex justify={"space-between"} align={"end"}>
                            <Text size={"xl"} hierarchy={"primary"}>General</Text>
                            <Button color={"success"}>
                                Save changes
                            </Button>
                        </Flex>
                        <Spacing spacing={"xl"}/>
                        <Card color={"secondary"}>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Text size={"md"} hierarchy={"primary"}>Name</Text>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Text size={"md"} hierarchy={"primary"}>Description</Text>
                                </Flex>
                            </CardSection>
                        </Card>
                    </TabContent>
                    <TabContent value={"access"}>
                        <Text size={"xl"} hierarchy={"primary"}>How to connect</Text>
                        <Spacing spacing={"xl"}/>
                        <Card color={"info"}>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Access token</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Is used to connect the runtime to our
                                            service</Text>
                                    </Flex>
                                    <Button variant={"filled"}>
                                        Generate new token
                                    </Button>
                                </Flex>
                            </CardSection>
                        </Card>

                    </TabContent>
                    <TabContent value={"delete"}>
                        <Flex justify={"space-between"} align={"end"}>
                            <Text size={"xl"} hierarchy={"primary"}>Delete runtime</Text>
                        </Flex>
                        <Spacing spacing={"xl"}/>
                        <Card p={1.3} color={"error"}>
                            <Flex justify={"space-between"} align={"center"}>
                                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                    <Text size={"md"} hierarchy={"primary"}>
                                        This will delete the runtime and cannot be undone.
                                    </Text>
                                </Flex>
                                <Button color={"secondary"} variant={"filled"}>
                                    Delete runtime
                                </Button>
                            </Flex>
                        </Card>
                    </TabContent>
                </>
            </DResizablePanel>
        </DResizablePanelGroup>
    </Tab>
}
