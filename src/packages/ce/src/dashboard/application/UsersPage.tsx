"use client"

import React from "react";
import {
    Button,
    DUserList,
    Flex,
    Spacing,
    Text,
    TextInput, useService, useStore, useUserSession,
} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import {UserService} from "@edition/user/User.service";
import {notFound} from "next/navigation";
export const UsersPage: React.FC = () => {

    const currentSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])

    if (currentUser && !currentUser.admin) {
        return notFound()
    }

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