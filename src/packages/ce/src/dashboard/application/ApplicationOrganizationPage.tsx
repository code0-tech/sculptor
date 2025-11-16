"use client"

import {Button, DOrganizationList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import React from "react";
import Link from "next/link";

export const ApplicationOrganizationPage = () => {
    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Organizations
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find an organization..."}/>
                <Link href={"/organizations/create"}>
                    <Button color={"success"}>Create Organization</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <DOrganizationList/>
    </>
}