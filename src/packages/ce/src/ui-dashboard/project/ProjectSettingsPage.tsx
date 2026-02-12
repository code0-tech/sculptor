import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";

"use clients"

import React from "react";
import {Button, DResizableHandle, DResizablePanel, DResizablePanelGroup, Flex, Text} from "@code0-tech/pictor";
import {IconLayoutSidebar} from "@tabler/icons-react";
import {ProjectSettingsGeneralView} from "@edition/ui-dashboard/project/ProjectSettingsGeneralView";
import {ProjectSettingsRuntimesView} from "@edition/ui-dashboard/project/ProjectSettingsRuntimesView";
import {ProjectSettingsDeleteView} from "@edition/ui-dashboard/project/ProjectSettingsDeleteView";

export const ProjectSettingsPage: React.FC = () => {
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
                                <Text size={"md"}>General</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"access"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>Runtimes</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"delete"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>Delete</Text>
                            </Button>
                        </TabTrigger>
                    </TabList>
                </Flex>
            </DResizablePanel>
            <DResizableHandle/>
            <DResizablePanel id={"2"} color={"primary"} p={1}
                             style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                <>
                    <ProjectSettingsGeneralView/>
                    <ProjectSettingsRuntimesView/>
                    <ProjectSettingsDeleteView/>
                </>
            </DResizablePanel>
        </DResizablePanelGroup>
    </Tab>
}