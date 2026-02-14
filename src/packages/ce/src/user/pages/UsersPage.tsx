"use client"

import React from "react";
import {Button, DUserList, Flex, Spacing, Text, useService, useStore, useUserSession,} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {notFound} from "next/navigation";
import {UserDataTableComponent} from "@edition/user/components/UserDataTableComponent";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {RuntimeDataTableFilterInputComponent} from "@edition/runtime/components/RuntimeDataTableFilterInputComponent";
import {UserDataTableFilterInputComponent} from "@edition/user/components/UserDataTableFilterInputComponent";

export const UsersPage: React.FC = () => {

    const currentSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])

    const [filter, setFilter] = React.useState<DataTableFilterProps>({})
    const [sort, setSort] = React.useState<DataTableSortProps>({})

    if (currentUser && !currentUser.admin) {
        notFound()
    }

    return <div style={{background: "#070514", height: "100%", padding: "1rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Users
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage users who have access to your instance. You can invite new users and remove existing ones.
                </Text>
            </Flex>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Button color={"success"}>Invite</Button>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <div style={{width: "100%"}}>
            <UserDataTableFilterInputComponent onChange={filter => setFilter(filter)}/>
        </div>
        <Spacing spacing={"xl"}/>
        <UserDataTableComponent filter={filter}/>
    </div>
}