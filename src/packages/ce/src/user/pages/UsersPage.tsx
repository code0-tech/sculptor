"use client"

import React from "react";
import {Button, ButtonGroup, Flex, Spacing, Text, useService, useStore, useUserSession, Menu, MenuTrigger, MenuPortal, MenuContent, MenuCheckboxItem} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {notFound} from "next/navigation";
import {UserDataTableComponent} from "@edition/user/components/UserDataTableComponent";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {UserDataTableFilterInputComponent} from "@edition/user/components/UserDataTableFilterInputComponent";
import Link from "next/link";
import {IconMinus, IconSortAscending, IconSortDescending} from "@tabler/icons-react";

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

    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Users
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage users who have access to your instance. You can invite new users and remove existing ones.
                </Text>
            </Flex>
            <ButtonGroup>
                <Button color={"success"}>Invite</Button>
                <Menu>
                    <MenuTrigger asChild>
                        <Button color={"secondary"} variant={"filled"}>Sort</Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent>
                            <MenuCheckboxItem
                                checked={sort["username"] === undefined ? "indeterminate" : sort["username"] === "asc"}
                                onSelect={event => {
                                    if (sort["username"] === undefined)
                                        setSort(prev => ({...prev, username: "asc"}))
                                    else if (sort["username"] === "asc")
                                        setSort(prev => ({...prev, username: "desc"}))
                                    else
                                        setSort(prev => ({...prev, username: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["username"] === undefined ? <IconMinus size={13}/> : sort["name"] === "asc" ?
                                    <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Username
                            </MenuCheckboxItem>
                            <MenuCheckboxItem
                                checked={sort["createdAt"] === undefined ? "indeterminate" : sort["createdAt"] === "asc"}
                                onSelect={event => {
                                    if (sort["createdAt"] === undefined)
                                        setSort(prev => ({...prev, createdAt: "asc"}))
                                    else if (sort["createdAt"] === "asc")
                                        setSort(prev => ({...prev, createdAt: "desc"}))
                                    else
                                        setSort(prev => ({...prev, createdAt: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["createdAt"] === undefined ?
                                    <IconMinus size={13}/> : sort["createdAt"] === "asc" ?
                                        <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Created At
                            </MenuCheckboxItem>
                            <MenuCheckboxItem
                                checked={sort["updatedAt"] === undefined ? "indeterminate" : sort["updatedAt"] === "asc"}
                                onSelect={event => {
                                    if (sort["updatedAt"] === undefined)
                                        setSort(prev => ({...prev, updatedAt: "asc"}))
                                    else if (sort["updatedAt"] === "asc")
                                        setSort(prev => ({...prev, updatedAt: "desc"}))
                                    else
                                        setSort(prev => ({...prev, updatedAt: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["updatedAt"] === undefined ?
                                    <IconMinus size={13}/> : sort["updatedAt"] === "asc" ?
                                        <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Updated At
                            </MenuCheckboxItem>
                        </MenuContent>
                    </MenuPortal>
                </Menu>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xl"}/>
        <div style={{width: "100%"}}>
            <UserDataTableFilterInputComponent onChange={filter => setFilter(filter)}/>
        </div>
        <Spacing spacing={"xl"}/>
        <UserDataTableComponent sort={sort} filter={filter}/>
    </div>
}