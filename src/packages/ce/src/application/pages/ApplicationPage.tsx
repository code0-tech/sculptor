import {PersonalProjectsView} from "@edition/project/views/PersonalProjectsView";
import {
    AuroraBackground,
    Avatar,
    Badge,
    Button,
    ButtonGroup,
    Card,
    Col,
    Flex,
    Row,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {OrganizationView} from "@edition/organization/services/Organization.view";
import {ProjectService} from "@edition/project/services/Project.service";
import {Namespace, Organization} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import {NamespacesTopView} from "@edition/namespace/views/NamespacesTopView";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {IconArrowUpRight, IconMail, IconSparkles, IconTrendingUp, IconUser} from "@tabler/icons-react";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import Link from "next/link";

const withinDays = (time: string | null | undefined, days: number): boolean =>
    !!time && Date.now() - new Date(time).getTime() < days * 24 * 60 * 60 * 1000

export const ApplicationPage = () => {

    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const userSession = useUserSession()
    const currentUser = React.useMemo(() => userService.getById(userSession?.user?.id), [userStore, userSession])
    const namespaceIndex = currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]

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

    const organizationNamespaces = React.useMemo(
        () => namespaces.filter(namespace => namespace.parent?.__typename === "Organization"),
        [namespaces]
    )

    const organizations = React.useMemo(
        () => organizationNamespaces
            .map(namespace => organizationService.getById((namespace.parent as Organization).id))
            .filter((organization): organization is OrganizationView => !!organization),
        [organizationNamespaces, organizationStore]
    )

    const projects = React.useMemo(
        () => namespaces.flatMap(namespace => projectService.values({namespaceId: namespace.id})),
        [namespaces, projectStore]
    )

    const ownedOrganizationsCount = organizations.filter(organization => organization.userAbilities?.deleteOrganization).length
    const memberOrganizationsCount = organizationNamespaces.length - ownedOrganizationsCount
    const newOrganizationsLastMonth = organizations.filter(organization => withinDays(organization.createdAt, 30)).length

    const totalProjectsCount = namespaces.reduce((sum, namespace) => sum + (namespace.projects?.count ?? 0), 0)
    const personalProjectsCount = namespaces.find(namespace => namespace.id === currentUser?.namespace?.id)?.projects?.count ?? 0
    const organizationProjectsCount = totalProjectsCount - personalProjectsCount
    const newProjectsLastWeek = projects.filter(project => withinDays(project.createdAt, 7)).length

    const totalFlowsCount = projects.reduce((sum, project) => sum + (project.flows?.count ?? 0), 0)
    const newFlowsLastMonth = projects
        .flatMap(project => project.flows?.nodes ?? [])
        .filter(flow => withinDays(flow?.createdAt, 30)).length

    const leftContent = <ScrollArea h={"100%"} type={"scroll"}>
        <ScrollAreaViewport>
            <Flex miw={"17vw"} style={{flexDirection: "column"}}>
                <div style={{position: "relative"}}>
                    <Avatar type={"character"} size={150} identifier={currentUser?.username!}/>
                    <Badge pos={"absolute"} right={"20%"} bottom={"20%"}>
                        <Text size={"md"}>👋</Text>
                    </Badge>
                </div>
                <Spacing spacing={"xs"}/>
                <Text size={"xl"} hierarchy={"primary"}>{currentUser?.firstname} {currentUser?.lastname}</Text>
                <Spacing spacing={"xs"}/>
                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconUser size={16}/>
                        @{currentUser?.username}
                    </Text>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconMail size={16}/>
                        {currentUser?.email}
                    </Text>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconSparkles size={16}/>
                        <Badge color={"primary"}>BASIC</Badge>
                    </Text>
                </Flex>
                <Spacing spacing={"xs"}/>
                <Link href={"/users/@me/settings"}>
                    <Button w={"100%"} color={"tertiary"}>Edit Profile</Button>
                </Link>
                <Spacing spacing={"xs"}/>
                <Button color={"primary"} disabled w={"100%"}>
                    Upgrade to Pro
                    <AuroraBackground/>
                </Button>
            </Flex>
        </ScrollAreaViewport>
    </ScrollArea>

    return <Layout showLayoutSplitter={false} pl={2.6} layoutGap={"2.6rem"} leftContent={leftContent}>
        <div style={{
            background: "#070514",
            height: "100%",
            padding: "2rem",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem"
        }}>
            <ScrollArea h={"100%"} type={"scroll"}>
                <ScrollAreaViewport>
                    <Text size={"xl"} fz={2} hierarchy={"primary"}>
                        Overview
                    </Text>
                    <Spacing spacing={"xs"}/>
                    <Text hierarchy={"tertiary"}>
                        Track the current state of your organizations, projects and flows at a single glance <br/>
                        and keep an eye on how your activity has developed across every area over the recent
                        weeks
                    </Text>
                    <Spacing spacing={"xl"}/>
                    <Row>
                        <Col xs={4}>
                            <Card color={"tertiary"} h={"fit-content"} paddingSize={"md"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"primary"}>
                                        Organizations
                                    </Text>
                                    {newOrganizationsLastMonth > 0 && <Badge color={"success"}>
                                        <IconTrendingUp size={13}/>
                                        +{newOrganizationsLastMonth} last month
                                    </Badge>}
                                </Flex>

                                <Spacing spacing={"xs"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <Flex align={"start"} style={{gap: "1.3rem"}}>
                                        <Text size={"xl"} hierarchy={"primary"}>
                                            {organizationNamespaces.length}
                                        </Text>
                                        <Text>
                                            You are the owner of {ownedOrganizationsCount} organizations <br/> and a
                                            member of {memberOrganizationsCount}
                                        </Text>
                                    </Flex>
                                </Card>
                            </Card>
                        </Col>
                        <Col xs={4}>
                            <Card color={"tertiary"} h={"fit-content"} paddingSize={"md"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"primary"}>
                                        Projects
                                    </Text>
                                    {newProjectsLastWeek > 0 && <Badge color={"success"}>
                                        <IconTrendingUp size={13}/>
                                        +{newProjectsLastWeek} last week
                                    </Badge>}
                                </Flex>

                                <Spacing spacing={"xs"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <Flex align={"start"} style={{gap: "1.3rem"}}>
                                        <Text size={"xl"} hierarchy={"primary"}>
                                            {totalProjectsCount}
                                        </Text>
                                        <Text>
                                            {personalProjectsCount} in your personal workspace <br/> and
                                            {" "}{organizationProjectsCount} in your organizations
                                        </Text>
                                    </Flex>
                                </Card>
                            </Card>
                        </Col>
                        <Col xs={4}>
                            <Card color={"tertiary"} h={"fit-content"} paddingSize={"md"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"primary"}>
                                        Flows
                                    </Text>
                                    {newFlowsLastMonth > 0 && <Badge color={"success"}>
                                        <IconTrendingUp size={13}/>
                                        +{newFlowsLastMonth} last month
                                    </Badge>}
                                </Flex>

                                <Spacing spacing={"xs"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <Flex align={"start"} style={{gap: "1.3rem"}}>
                                        <Text size={"xl"} hierarchy={"primary"}>
                                            {totalFlowsCount}
                                        </Text>
                                        <Text>
                                            Spread across {totalProjectsCount} projects <br/> and
                                            {" "}{namespaces.length} workspaces
                                        </Text>
                                    </Flex>
                                </Card>
                            </Card>
                        </Col>
                    </Row>
                    <Spacing spacing={"xl"}/>
                    <Text size={"xl"} hierarchy={"primary"}>
                        Your work
                    </Text>
                    <Spacing spacing={"xs"}/>
                    <Text hierarchy={"tertiary"}>
                        A quick summary of the personal projects you own and the organizations you belong to <br/>
                        so you can jump straight back into your recent work or start something completely
                        new
                    </Text>
                    <Spacing spacing={"xl"}/>
                    <Row>
                        <Col xs={7}>
                            <Card color={"tertiary"} h={"fit-content"} paddingSize={"md"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"primary"}>
                                        Personal projects
                                    </Text>
                                    <ButtonGroup color={"primary"}>
                                        <Link href={`/namespace/${namespaceIndex}/projects/create`} tabIndex={-1}>
                                            <Button paddingSize={"xxs"} color={"secondary"}>
                                                Create project
                                            </Button>
                                        </Link>
                                        <Link href={`/namespace/${namespaceIndex}`} tabIndex={-1}>
                                            <Button paddingSize={"xxs"} color={"secondary"} variant={"none"}>
                                                <IconArrowUpRight size={13}/>
                                            </Button>
                                        </Link>
                                    </ButtonGroup>

                                </Flex>
                                <Spacing spacing={"md"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <PersonalProjectsView/>
                                </Card>
                            </Card>
                        </Col>
                        <Col xs={5}>
                            <Card color={"tertiary"} h={"fit-content"} paddingSize={"md"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"secondary"}>
                                        Top workspaces
                                    </Text>
                                    <ButtonGroup color={"primary"}>
                                        <Link href={"/workspaces/create"} tabIndex={-1}>
                                            <Button paddingSize={"xxs"} color={"secondary"}>
                                                Create workspace
                                            </Button>
                                        </Link>
                                        <Link href={"/workspaces"} tabIndex={-1}>
                                            <Button paddingSize={"xxs"} color={"secondary"} variant={"none"}>
                                                <IconArrowUpRight size={13}/>
                                            </Button>
                                        </Link>
                                    </ButtonGroup>
                                </Flex>
                                <Spacing spacing={"xs"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <NamespacesTopView/>
                                </Card>
                            </Card>
                        </Col>
                    </Row>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation={"vertical"}>
                    <ScrollAreaThumb/>
                </ScrollAreaScrollbar>
            </ScrollArea>
        </div>
    </Layout>

}