"use client"

import React from "react";
import {
    Avatar,
    Badge,
    Button,
    ButtonGroup, Card,
    Col,
    Flex, hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuTrigger,
    Row, Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {
    IconAdjustmentsHorizontal,
    IconArrowsSort,
    IconCheck,
    IconFolders,
    IconPlus,
    IconUsers
} from "@tabler/icons-react";
import Link from "next/link";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

const filterLabels = {
    all: "All",
    personal: "Personal",
    organization: "Organizations",
} as const

const sortLabels = {
    name: "Name",
    projects: "Projects",
    members: "Members",
} as const

export const NamespaceRowView: React.FC = () => {

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, userService, currentSession?.user?.id]
    )

    const memberships = React.useMemo(
        () => currentUser?.namespaceMemberships?.nodes ?? [],
        [currentUser?.namespaceMemberships?.nodes?.length]
    )

    const namespaces = React.useMemo(
        () => memberships
            .map(membership => namespaceService.getById(membership?.namespace?.id))
            .filter((namespace): namespace is Namespace => !!namespace),
        [memberships.length, namespaceStore]
    )

    const [filter, setFilter] = React.useState<keyof typeof filterLabels>("all")
    const [sort, setSort] = React.useState<keyof typeof sortLabels>("name")

    const visibleNamespaces = React.useMemo(() => {
        const filtered = namespaces.filter(namespace => {
            if (filter === "all") return true
            const personal = namespace.parent?.__typename === "User"
            return filter === "personal" ? personal : !personal
        })
        return [...filtered].sort((a, b) => {
            if (sort === "projects") return (b.projects?.count ?? 0) - (a.projects?.count ?? 0)
            if (sort === "members") return (b.members?.count ?? 0) - (a.members?.count ?? 0)
            return (getNamespaceName(a, organizationService, userService) ?? "")
                .localeCompare(getNamespaceName(b, organizationService, userService) ?? "")
        })
    }, [namespaces, filter, sort, organizationStore, userStore])

    return <>
        <Flex align={"center"} justify={"space-between"} style={{gap: "0.5rem"}}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text hierarchy={"tertiary"} size={"md"}>Workspaces</Text>
                <Badge color={"secondary"}>{visibleNamespaces.length}</Badge>
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

                {/* Create */}
                <Link href={"/workspaces/create"} prefetch>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>

        {/* ── The grid users choose from; create sits in the same grid ── */}
        <Row>
            {visibleNamespaces.map(namespace => {
                const number = namespace.id?.match(/Namespace\/(\d+)$/)?.[1]
                const name = getNamespaceName(namespace, organizationService, userService) ?? ""
                const isPersonal = namespace.parent?.__typename === "User"
                const user = namespace.parent?.__typename === "User"
                    ? userService.getById(namespace.parent.id) : undefined
                return <Col key={namespace.id} xs={6} mb={1}>
                    <Link href={`/namespace/${number}`} prefetch style={{display: "contents"}}>
                    <Card color={"secondary"} clickable h={"100%"}>
                        <Flex style={{flexDirection: "column", gap: "1.25rem"}}>
                            {/* identity: avatar (user avatar for personal, identicon for org), name and personal marker */}
                            <Flex align={"center"} style={{gap: "0.85rem"}}>
                                {isPersonal
                                    ? <Avatar type={"character"} identifier={user?.username ?? ""} size={24}/>
                                    : <Avatar color={hashToColor(name, 200, 360)}
                                              bg={"transparent"} identifier={name} size={24}/>}
                                <Flex align={"center"} style={{gap: "0.5rem", minWidth: 0, flex: 1}}>
                                    <Text size={"md"} hierarchy={"primary"} fw={500}>{name}</Text>
                                    {isPersonal && <Badge color={"info"}>Personal</Badge>}
                                </Flex>
                            </Flex>
                            {/* metadata: one calm, labelled line */}
                            <Flex align={"center"} style={{gap: "1.25rem"}}>
                                <Flex align={"center"} style={{gap: "0.4rem"}}>
                                    <IconFolders size={15}/>
                                    <Text size={"sm"} hierarchy={"tertiary"}>
                                        {namespace.projects?.count ?? 0} projects
                                    </Text>
                                </Flex>
                                <Flex align={"center"} style={{gap: "0.4rem"}}>
                                    <IconUsers size={15}/>
                                    <Text size={"sm"} hierarchy={"tertiary"}>
                                        {namespace.members?.count ?? 0} members
                                    </Text>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Card>
                    </Link>
                </Col>
            })}

            {/* create-workspace affordance, matching card footprint */}
            <Col xs={6} mb={1} mih={"100px"}>
                <Link href={"/workspaces/create"} prefetch style={{display: "contents"}}>
                    <Button variant={"none"} h={"100%"} w={"100%"} style={{
                        border: "1px dashed rgba(255,255,255, .15)",
                        borderRadius: "0.75rem",
                    }}>
                        <Flex align={"center"} justify={"center"} style={{
                            flexDirection: "column",
                            gap: "0.4rem",
                        }}>
                            <IconPlus size={18}/>
                            <Text size={"md"} hierarchy={"tertiary"}>
                                Create workspace
                            </Text>
                        </Flex>
                    </Button>
                </Link>
            </Col>
        </Row>
    </>
}
