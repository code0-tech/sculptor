"use client"

import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import React from "react";
import {Button, Flex, Text} from "@code0-tech/pictor";
import {IconLayoutSidebar} from "@tabler/icons-react";
import {ProjectSettingsGeneralView} from "@edition/project/views/ProjectSettingsGeneralView";
import {ProjectSettingsRuntimesView} from "@edition/project/views/ProjectSettingsRuntimesView";
import {ProjectSettingsDeleteView} from "@edition/project/views/ProjectSettingsDeleteView";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";

export const ProjectSettingsPage: React.FC = () => {
    return <Tab orientation={"vertical"} defaultValue={"general"} h={"100%"}>
        <ResizablePanelGroup>
            <SidebarComponent id={"1"}
                              title={"Project settings"}
                              description={"General settings and restrictions for your Sculptor application. These settings affect all users and organizations within the application."}>
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
            </SidebarComponent>
            <ResizableHandle/>
            <ResizablePanel id={"2"} color={"primary"} p={1}
                            style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                <>
                    <ProjectSettingsGeneralView/>
                    <ProjectSettingsRuntimesView/>
                    <ProjectSettingsDeleteView/>
                </>
            </ResizablePanel>
        </ResizablePanelGroup>
    </Tab>
}