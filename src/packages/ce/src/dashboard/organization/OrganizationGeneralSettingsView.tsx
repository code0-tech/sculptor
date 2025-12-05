"use client"

import React from "react";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {Button, Card, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";

export const OrganizationDeleteView: React.FC = () => {
    return <>
        <Flex justify={"space-between"} align={"end"}>
            <Text size={"xl"} hierarchy={"primary"}>General adjustments</Text>
            <Button color={"success"}>
                Update Organization
            </Button>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Card p={1.3}>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Text size={"md"} hierarchy={"primary"}>Name</Text>
                    <TextInput/>
                </Flex>
            </CardSection>
        </Card>
    </>
}