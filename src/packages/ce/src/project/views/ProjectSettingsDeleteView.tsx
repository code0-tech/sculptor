"use client"

import React from "react";
import {Button, Card, Flex, Spacing, Text} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";

export const ProjectSettingsDeleteView: React.FC = () => {
    return <TabContent value={"delete"}>
        <Flex justify={"space-between"} align={"end"}>
            <Text size={"xl"} hierarchy={"primary"}>Delete</Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Card p={1.3} color={"error"}>
            <Flex justify={"space-between"} align={"center"}>
                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        This will delete the project and cannot be undone.
                    </Text>
                </Flex>
                <Button color={"secondary"} variant={"filled"}>
                    Delete project
                </Button>
            </Flex>
        </Card>
    </TabContent>
}