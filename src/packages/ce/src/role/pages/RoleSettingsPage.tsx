"use client"

import React from "react";
import {
    Button,
    DResizableHandle,
    DResizablePanel,
    DResizablePanelGroup,
    Flex,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Text
} from "@code0-tech/pictor";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {RoleProjectView} from "@edition/role/views/RoleProjectView";
import {RolePermissionView} from "@edition/role/views/RolePermissionView";
import {RoleGeneralAdjustmentView} from "@edition/role/views/RoleGeneralAdjustmentView";
import {RoleDeleteView} from "@edition/role/views/RoleDeleteView";
import {IconLayoutSidebar} from "@tabler/icons-react";

export const RoleSettingsPage: React.FC = () => {

    //TODO: limit tabs based on user abilities for roles

    return <>
        <Tab orientation={"vertical"} defaultValue={"general"} h={"100%"}>
            <DResizablePanelGroup>
                <DResizablePanel id={"1"} defaultSize={"20%"} collapsedSize={"0%"}
                                 collapsible minSize={"10%"} style={{textWrap: "nowrap"}}>
                    <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                        <Flex style={{gap: "0.7rem"}} align={"center"} justify={"space-between"}>
                            <Text size={"md"} hierarchy={"secondary"}>Role settings</Text>

                            <Button variant={"none"} paddingSize={"xxs"}>
                                <IconLayoutSidebar size={16}/>
                            </Button>
                        </Flex>
                        <Text size={"sm"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                            General settings and restrictions for your Sculptor application. These settings affect all
                            users
                            and organizations within the application.
                        </Text>
                        <TabList pr={"0.7"}>
                            <TabTrigger value={"general"} w={"100%"} asChild>
                                <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                    <Text size={"md"}>General</Text>
                                </Button>
                            </TabTrigger>
                            <TabTrigger value={"permission"} w={"100%"} asChild>
                                <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                    <Text size={"md"}>Permissions</Text>
                                </Button>
                            </TabTrigger>
                            <TabTrigger value={"project"} w={"100%"} asChild>
                                <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                    <Text size={"md"}>Limit to projects</Text>
                                </Button>
                            </TabTrigger>
                            <TabTrigger value={"delete"} w={"100%"} asChild>
                                <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                    <Text size={"md"}>Delete role</Text>
                                </Button>
                            </TabTrigger>
                        </TabList>
                    </Flex>
                </DResizablePanel>
                <DResizableHandle/>
                <DResizablePanel id={"2"} color={"primary"} p={1}
                                 style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                    <ScrollArea h={"100%"} w={"100%"} type={"scroll"}>
                        <ScrollAreaViewport>
                            <RoleGeneralAdjustmentView/>
                            <RolePermissionView/>
                            <RoleProjectView/>
                            <RoleDeleteView/>
                        </ScrollAreaViewport>
                        <ScrollAreaScrollbar orientation={"vertical"}>
                            <ScrollAreaThumb/>
                        </ScrollAreaScrollbar>
                    </ScrollArea>
                </DResizablePanel>
            </DResizablePanelGroup>
        </Tab>
    </>
}