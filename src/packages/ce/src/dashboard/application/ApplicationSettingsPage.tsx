"use client"

import React from "react";
import {
    Badge,
    Button,
    Card,
    DLayout,
    Flex,
    InputLabel,
    Spacing,
    SwitchInput,
    Text,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import {notFound} from "next/navigation";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconGavel, IconSettings} from "@tabler/icons-react";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import process from "node:process";

export const ApplicationSettingsPage: React.FC = () => {
    const currentSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])

    if (currentUser && !currentUser.admin) {
        notFound()
    }

    return <>
        <Spacing spacing={"xl"}/>
        <Tab orientation={"vertical"} defaultValue={"general"}>
            <DLayout leftContent={
                <TabList>
                    <InputLabel>Application</InputLabel>
                    <TabTrigger value={"general"} asChild>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <IconSettings size={16}/>
                            <Text size={"md"} hierarchy={"primary"}>General</Text>
                        </Button>
                    </TabTrigger>
                    <TabTrigger value={"restrictions"} asChild>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <IconGavel size={16}/>
                            <Text size={"md"} hierarchy={"primary"}>Restrictions</Text>
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
                        <Card p={1.3}>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Sculptor version</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Version of this application</Text>
                                    </Flex>
                                    <Badge color={"info"}>v0.0.0-mvp.1</Badge>
                                </Flex>
                            </CardSection>

                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Pictor version</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Version of the UI component
                                            library</Text>
                                    </Flex>
                                    <Badge
                                        color={"info"}>{process.env.NEXT_PUBLIC_pictorVersion ?? "v0.0.0-mvp.10"}</Badge>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Sagittarius version</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Version of the backend</Text>
                                    </Flex>
                                    <Badge color={"info"}>2134929721-ee</Badge>
                                </Flex>
                            </CardSection>
                        </Card>
                    </TabContent>
                    <TabContent value={"restrictions"}>
                        <Text size={"xl"} hierarchy={"primary"}>Restrictions</Text>
                        <Spacing spacing={"xl"}/>
                        <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                        <Spacing spacing={"xl"}/>
                        <Flex style={{gap: "1.3rem", flexDirection: "column"}}>
                            <Card p={1.3}>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Organization creation</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Set if organization creation is
                                            restricted
                                            to
                                            administrators.</Text>
                                    </Flex>
                                    <SwitchInput w={"40px"}/>
                                </Flex>
                            </Card>
                            <Spacing spacing={"xxs"}/>
                            <Text size={"xl"} hierarchy={"primary"}>Danger Zone</Text>
                            <div style={{borderBottom: "1px solid rgba(255,255,255,.1)"}}/>
                            <Card color={"error"} p={1.3}>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>User registration</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Set if user registration is
                                            enabled.</Text>
                                    </Flex>
                                    <SwitchInput w={"40px"}/>
                                </Flex>
                            </Card>
                        </Flex>

                    </TabContent>
                </>
            </DLayout>
        </Tab>
    </>
}