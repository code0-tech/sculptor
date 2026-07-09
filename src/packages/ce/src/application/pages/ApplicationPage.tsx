import {PersonalProjectsView} from "@edition/project/views/PersonalProjectsView";
import {
    AuroraBackground,
    Avatar,
    Badge,
    Button,
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
import React from "react";
import {OrganizationsTopView} from "@edition/organization/views/OrganizationsTopView";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {IconMail, IconSparkles, IconTrendingUp, IconUser} from "@tabler/icons-react";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";

export const ApplicationPage = () => {

    const userStore = useStore(UserService)
    const userService = useService(UserService)

    const userSession = useUserSession()
    const currentUser = React.useMemo(() => userService.getById(userSession?.user?.id), [userStore, userSession])

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
                <Button w={"100%"} disabled color={"tertiary"}>Edit Profile</Button>
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
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor <br/>
                        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
                        et
                    </Text>
                    <Spacing spacing={"xl"}/>
                    <Row>
                        <Col xs={4}>
                            <Card color={"tertiary"} h={"fit-content"} paddingSize={"md"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"primary"}>
                                        Organizations
                                    </Text>
                                    <Badge color={"success"}>
                                        <IconTrendingUp size={13}/>
                                        +2 last month
                                    </Badge>
                                </Flex>

                                <Spacing spacing={"xs"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <Flex align={"start"} style={{gap: "1.3rem"}}>
                                        <Text size={"xl"} hierarchy={"primary"}>
                                            7
                                        </Text>
                                        <Text>
                                            You are the owner of 3 organizations <br/> and a member of 4
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
                                    <Badge color={"success"}>
                                        <IconTrendingUp size={13}/>
                                        +8 last week
                                    </Badge>
                                </Flex>

                                <Spacing spacing={"xs"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <Flex align={"start"} style={{gap: "1.3rem"}}>
                                        <Text size={"xl"} hierarchy={"primary"}>
                                            82
                                        </Text>
                                        <Text>
                                            You are the owner of 40 projects <br/> and a member of 42
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
                                    <Badge color={"success"}>
                                        <IconTrendingUp size={13}/>
                                        +102 last month
                                    </Badge>
                                </Flex>

                                <Spacing spacing={"xs"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <Flex align={"start"} style={{gap: "1.3rem"}}>
                                        <Text size={"xl"} hierarchy={"primary"}>
                                            781
                                        </Text>
                                        <Text>
                                            You are the owner of 361 flows <br/> and a member of 420
                                        </Text>
                                    </Flex>
                                </Card>
                            </Card>
                        </Col>
                    </Row>
                    <Spacing spacing={"xl"}/>
                    <Text size={"xl"} hierarchy={"primary"}>
                        Overview
                    </Text>
                    <Spacing spacing={"xs"}/>
                    <Text hierarchy={"tertiary"}>
                        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor <br/>
                        invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
                        et
                    </Text>
                    <Spacing spacing={"xl"}/>
                    <Row>
                        <Col xs={7}>
                            <Card color={"tertiary"} h={"fit-content"} paddingSize={"md"}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"primary"}>
                                        Personal projects
                                    </Text>
                                    <Button paddingSize={"xxs"} color={"primary"}>
                                        Create project
                                    </Button>
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
                                        Top organizations
                                    </Text>
                                    <Button paddingSize={"xxs"} color={"primary"}>
                                        Create organization
                                    </Button>
                                </Flex>
                                <Spacing spacing={"xs"}/>
                                <Card color={"primary"} paddingSize={"md"} mx={-0.9} mb={-0.9}>
                                    <OrganizationsTopView/>
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