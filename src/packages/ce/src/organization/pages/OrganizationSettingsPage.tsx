"use client"

import React from "react";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {
    AuroraBackground,
    Badge,
    Button,
    DResizableHandle,
    DResizablePanel,
    DResizablePanelGroup,
    Flex,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {IconLayoutSidebar} from "@tabler/icons-react";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {UsageView} from "@edition/runtime/views/UsageView";
import {OrganizationUpgradeView} from "@edition/organization/views/OrganizationUpgradeView";
import {OrganizationDeleteView} from "@edition/organization/views/OrganizationDeleteView";
import {OrganizationGeneralSettingsView} from "@edition/organization/views/OrganizationGeneralSettingsView";

export const OrganizationSettingsPage: React.FC = () => {

    //TODO: add ability check for organization settings access for every settings tab

    return <Tab orientation={"vertical"} defaultValue={"general"} h={"100%"}>
        <DResizablePanelGroup>
            <DResizablePanel id={"1"} defaultSize={"20%"} collapsedSize={"0%"}
                             collapsible minSize={"10%"} style={{textWrap: "nowrap"}}>
                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                    <Flex style={{gap: "0.7rem"}} align={"center"} justify={"space-between"}>
                        <Text size={"md"} hierarchy={"secondary"}>Organization settings</Text>

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
                                <Text size={"md"} hierarchy={"primary"}>General</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"upgrade"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"} hierarchy={"primary"} display={"flex"} align={"center"}
                                      style={{gap: "0.35rem"}}>
                                    Upgrade to Team
                                </Text>
                                <AuroraBackground/>
                            </Button>
                        </TabTrigger>
                        <TabTrigger disabled value={"usage"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"} hierarchy={"primary"}>Runtime usage</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"delete"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"} hierarchy={"primary"}>Delete organization</Text>
                            </Button>
                        </TabTrigger>
                    </TabList>
                </Flex>
            </DResizablePanel>
            <DResizableHandle/>
            <DResizablePanel id={"2"} color={"primary"} p={1} style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                <>
                    <TabContent value={"general"}>
                        <OrganizationGeneralSettingsView/>
                    </TabContent>
                    <TabContent value={"upgrade"}>
                        <OrganizationUpgradeView/>
                    </TabContent>
                    <TabContent value={"usage"}>
                        <UsageView/>
                    </TabContent>
                    <TabContent value={"delete"}>
                        <OrganizationDeleteView/>
                    </TabContent>
                </>
            </DResizablePanel>
        </DResizablePanelGroup>
    </Tab>
}