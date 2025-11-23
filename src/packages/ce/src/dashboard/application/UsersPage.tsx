"use client"

import React from "react";
import {
    Button,
    DUserList,
    Flex,
    Spacing,
    Text,
    TextInput,
} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
export const UsersPage: React.FC = () => {

    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Users
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a user..."}/>
                <Button color={"success"}>Invite user</Button>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <DUserList/>
    </>
}