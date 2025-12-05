"use client"

import React from "react";
import {Button, Card, Flex, Spacing, Text} from "@code0-tech/pictor";

export const OrganizationDeleteView: React.FC = () => {
    return <>
        <Flex justify={"space-between"} align={"end"}>
            <Text size={"xl"} hierarchy={"primary"}>Delete organization forever</Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Card p={1.3} color={"error"}>
            <Flex justify={"space-between"} align={"center"}>
                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>Delete organization</Text>
                    <Text size={"md"} hierarchy={"tertiary"}>
                        This will delete the organization and cannot be undone.
                    </Text>
                </Flex>
                <Button color={"error"}>
                    Delete organization forever
                </Button>
            </Flex>
        </Card>
    </>
}