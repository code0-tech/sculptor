"use client"

import React from "react";
import {
    Badge,
    Button,
    ButtonGroup,
    Col,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuTrigger,
    Row,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {
    IconAdjustmentsHorizontal,
    IconArrowsSort,
    IconCheck,
    IconPlus
} from "@tabler/icons-react";
import Link from "next/link";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";
import {NamespaceCardComponent} from "@edition/namespace/components/NamespaceCardComponent";

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
                <Text hierarchy={"secondary"} size={"lg"}>Workspaces</Text>
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
        <Text size={"md"} hierarchy={"tertiary"} maw={"50%"}>
            Manage your workspaces and the projects within them. You can create new workspaces or open existing ones.
        </Text>
        <Spacing spacing={"md"}/>

        {/* ── The grid users choose from; create sits in the same grid ── */}
        <Row>
            {visibleNamespaces.map(namespace => (
                <Col key={namespace.id} xs={6} mb={1}>
                    <NamespaceCardComponent namespace={namespace}/>
                </Col>
            ))}

            {/* create-workspace affordance, matching card footprint */}
            <Col xs={6} mb={1} mih={"100px"}>
                <Link href={"/workspaces/create"} prefetch style={{display: "contents"}}>
                    <Button paddingSize={"lg"} variant={"none"} h={"100%"} w={"100%"} style={{
                        border: "1px dashed rgba(255,255,255, .15)",
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
