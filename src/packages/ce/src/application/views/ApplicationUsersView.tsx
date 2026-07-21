"use client"

import React from "react";
import {
    Badge,
    Button,
    ButtonGroup,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {IconAdjustmentsHorizontal, IconArrowsSort, IconCheck, IconPlus} from "@tabler/icons-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {User} from "@code0-tech/sagittarius-graphql-types";
import {UserService} from "@edition/user/services/User.service";
import {UserDataTableComponent} from "@edition/user/components/UserDataTableComponent";

const filterLabels = {
    all: "All",
    admins: "Admins",
    blocked: "Blocked",
} as const

const sortLabels = {
    username: "Username",
    createdAt: "Created",
    updatedAt: "Updated",
} as const

export const ApplicationUsersView: React.FC = () => {

    const router = useRouter()
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const users = React.useMemo(() => userService.values(), [userStore])

    const [filter, setFilter] = React.useState<keyof typeof filterLabels>("all")
    const [sort, setSort] = React.useState<keyof typeof sortLabels>("username")

    const preFilter = React.useCallback((user: User) => {
        if (filter === "admins") return !!user.admin
        if (filter === "blocked") return !!user.blocked
        return true
    }, [filter])

    const visibleCount = React.useMemo(() => users.filter(preFilter).length, [users, preFilter])

    const sortProps: DataTableSortProps = {[sort]: "asc"}

    return <TabContent value={"users"}>
        <Flex justify={"space-between"} align={"center"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Users</Text>
                <Badge color={"secondary"}>{visibleCount}</Badge>
            </Flex>
            <ButtonGroup>
                {/* Filter */}
                <Menu>
                    <MenuTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"} active={filter !== "all"}>
                            <IconAdjustmentsHorizontal size={13}/>
                        </Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent sideOffset={8} align={"end"}>
                            <MenuLabel>Filter</MenuLabel>
                            {(Object.keys(filterLabels) as (keyof typeof filterLabels)[]).map(k => (
                                <MenuItem key={k} onSelect={() => setFilter(k)}>
                                    <IconCheck size={13} color={filter === k ? undefined : "transparent"}/>
                                    {filterLabels[k]}
                                </MenuItem>
                            ))}
                        </MenuContent>
                    </MenuPortal>
                </Menu>

                {/* Sort */}
                <Menu>
                    <MenuTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"}>
                            <IconArrowsSort size={13}/>
                        </Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent sideOffset={8} align={"end"}>
                            <MenuLabel>Sort by</MenuLabel>
                            {(Object.keys(sortLabels) as (keyof typeof sortLabels)[]).map(k => (
                                <MenuItem key={k} onSelect={() => setSort(k)}>
                                    <IconCheck size={13} color={sort === k ? undefined : "transparent"}/>
                                    {sortLabels[k]}
                                </MenuItem>
                            ))}
                        </MenuContent>
                    </MenuPortal>
                </Menu>

                {/* Invite */}
                <Link href={"/users/invite"}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Manage users who have access to your instance. You can invite new users and remove existing ones.
        </Text>
        <Spacing spacing={"md"}/>
        <UserDataTableComponent sort={sortProps}
                                preFilter={preFilter}
                                onSelect={(item) => {
                                    if (item?.id) router.push(`/users/${item.id.split("/").pop()}/settings`)
                                }}/>
    </TabContent>
}
