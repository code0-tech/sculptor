"use client"

import React from "react";
import {useParams} from "next/navigation";
import {
    Badge,
    Button,
    ButtonGroup,
    Flex,
    Menu,
    MenuCheckboxItem,
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
import {DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {IconAdjustmentsHorizontal, IconArrowsSort, IconCheck, IconPlus} from "@tabler/icons-react";
import Link from "next/link";
import {Namespace, NamespaceMember} from "@code0-tech/sagittarius-graphql-types";
import {MemberService} from "@edition/member/services/Member.service";
import {MemberDataTableComponent} from "@edition/member/components/MemberDataTableComponent";
import {RoleService} from "@edition/role/services/Role.service";

const sortLabels = {
    "user.username": "Username",
    createdAt: "Created",
    updatedAt: "Updated",
} as const

const toggle = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])

//TODO: user abilities for add user as member within namespace
export const MembersView: React.FC = () => {

    const params = useParams()
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const members = React.useMemo(
        () => memberService.values({namespaceId: namespaceId}),
        [memberStore, namespaceId]
    )

    const roles = React.useMemo(
        () => roleService.values({namespaceId: namespaceId}),
        [roleStore, namespaceId]
    )

    const usernames = React.useMemo(
        () => members.map(m => m?.user?.username).filter(Boolean) as string[],
        [members]
    )

    const [sort, setSort] = React.useState<keyof typeof sortLabels>("user.username")
    const [usernameFilter, setUsernameFilter] = React.useState<string[]>([])
    const [roleFilter, setRoleFilter] = React.useState<string[]>([])

    const preFilter = React.useCallback((member: NamespaceMember) => {
        if (usernameFilter.length > 0 && !usernameFilter.includes(member?.user?.username!)) return false
        if (roleFilter.length > 0 && !member?.roles?.nodes?.some(n => roleFilter.includes(n?.id!))) return false
        return true
    }, [usernameFilter, roleFilter])

    const visibleCount = React.useMemo(
        () => members.filter(preFilter).length,
        [members, preFilter]
    )

    const hasFilter = usernameFilter.length > 0 || roleFilter.length > 0

    const sortProps: DataTableSortProps = {[sort]: "asc"}

    return <>
        <Flex justify={"space-between"} align={"center"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Members</Text>
                <Badge color={"secondary"}>{visibleCount}</Badge>
            </Flex>
            <ButtonGroup>
                {/* Filter */}
                <Menu>
                    <MenuTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"} active={hasFilter}>
                            <IconAdjustmentsHorizontal size={13}/>
                        </Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent sideOffset={8} align={"end"}>
                            <MenuLabel>Username</MenuLabel>
                            {usernames.map(username => (
                                <MenuCheckboxItem key={username} checked={usernameFilter.includes(username)}
                                                  onSelect={e => {
                                                      e.preventDefault()
                                                      e.stopPropagation()
                                                      toggle(username, setUsernameFilter)
                                                  }}>
                                    <IconCheck size={13}
                                               color={usernameFilter.includes(username) ? undefined : "transparent"}/>
                                    @{username}
                                </MenuCheckboxItem>
                            ))}
                            <MenuLabel>Roles</MenuLabel>
                            {roles.map(role => (
                                <MenuCheckboxItem key={role.id} checked={roleFilter.includes(role?.id!)}
                                                  onSelect={e => {
                                                      e.preventDefault()
                                                      e.stopPropagation()
                                                      toggle(role?.id!, setRoleFilter)
                                                  }}>
                                    <IconCheck size={13}
                                               color={roleFilter.includes(role?.id!) ? undefined : "transparent"}/>
                                    {role?.name}
                                </MenuCheckboxItem>
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

                {/* Add */}
                <Link href={`/namespace/${namespaceIndex}/members/add`}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Manage members that belong to this namespace. You can add new members and manage their permissions.
        </Text>
        <Spacing spacing={"md"}/>
        <MemberDataTableComponent sort={sortProps}
                                  namespaceId={namespaceId}
                                  preFilter={preFilter}/>
    </>
}
