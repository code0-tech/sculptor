"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
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
import {Namespace, NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {RoleService} from "@edition/role/services/Role.service";
import {RoleDataTableComponent} from "@edition/role/components/RoleDataTableComponent";

const sortLabels = {
    name: "Name",
    createdAt: "Created",
    updatedAt: "Updated",
} as const

const toggle = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])

//TODO: user abilities for add role within namespace
export const RolesView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const roles = React.useMemo(
        () => roleService.values({namespaceId: namespaceId}),
        [roleStore, namespaceId]
    )

    const abilities = React.useMemo(() => {
        const all = new Set<string>()
        roles.forEach(role => role.abilities?.forEach(ability => all.add(ability)))
        return Array.from(all)
    }, [roles])

    const [sort, setSort] = React.useState<keyof typeof sortLabels>("name")
    const [nameFilter, setNameFilter] = React.useState<string[]>([])
    const [abilityFilter, setAbilityFilter] = React.useState<string[]>([])

    const preFilter = React.useCallback((role: NamespaceRole) => {
        if (nameFilter.length > 0 && !nameFilter.includes(role?.name!)) return false
        if (abilityFilter.length > 0 && !role?.abilities?.some(a => abilityFilter.includes(a))) return false
        return true
    }, [nameFilter, abilityFilter])

    const visibleCount = React.useMemo(
        () => roles.map(r => r.json()).filter(preFilter).length,
        [roles, preFilter]
    )

    const hasFilter = nameFilter.length > 0 || abilityFilter.length > 0

    const sortProps: DataTableSortProps = {[sort]: "asc"}

    return <>
        <Flex justify={"space-between"} align={"center"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Roles</Text>
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
                            <MenuLabel>Name</MenuLabel>
                            {roles.map(role => (
                                <MenuCheckboxItem key={role.id} checked={nameFilter.includes(role?.name!)}
                                                  onSelect={e => {
                                                      e.preventDefault()
                                                      e.stopPropagation()
                                                      toggle(role?.name!, setNameFilter)
                                                  }}>
                                    <IconCheck size={13}
                                               color={nameFilter.includes(role?.name!) ? undefined : "transparent"}/>
                                    {role?.name}
                                </MenuCheckboxItem>
                            ))}
                            <MenuLabel>Permissions</MenuLabel>
                            {abilities.map(ability => (
                                <MenuCheckboxItem key={ability} checked={abilityFilter.includes(ability)}
                                                  onSelect={e => {
                                                      e.preventDefault()
                                                      e.stopPropagation()
                                                      toggle(ability, setAbilityFilter)
                                                  }}>
                                    <IconCheck size={13}
                                               color={abilityFilter.includes(ability) ? undefined : "transparent"}/>
                                    {ability}
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

                {/* Create */}
                <Link href={`/namespace/${namespaceIndex}/roles/create`}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Manage roles that you belong to. You can create new roles and switch between them.
        </Text>
        <Spacing spacing={"md"}/>
        <RoleDataTableComponent sort={sortProps}
                                namespaceId={namespaceId}
                                preFilter={preFilter}
                                onSelect={(role) => {
                                    const roleIndex = role?.id?.match(/NamespaceRole\/(\d+)$/)?.[1]
                                    router.push(`/namespace/${namespaceIndex}/roles/${roleIndex}/settings`)
                                }}/>
    </>
}
