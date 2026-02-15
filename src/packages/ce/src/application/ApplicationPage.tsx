import {PersonalProjectsView} from "@edition/project/views/PersonalProjectsView";
import {OrganizationsView} from "@edition/organization/views/OrganizationsView";
import {
    AuroraBackground,
    Avatar,
    Badge,
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
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import React from "react";
import {OrganizationsTopView} from "@edition/organization/views/OrganizationsTopView";

export const ApplicationPage = () => {

    const userStore = useStore(UserService)
    const userService = useService(UserService)

    const userSession = useUserSession()
    const currentUser = React.useMemo(() => userService.getById(userSession?.user?.id), [userStore, userSession])

    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <ScrollArea h={"100%"} type={"scroll"}>
            <ScrollAreaViewport>
                <Spacing spacing={"xl"}/>
                <Flex style={{gap: "1.3rem"}} align={"center"} ml={0.5}>
                    <div style={{position: "relative"}}>
                        <Avatar size={64}
                                type={"character"}
                                identifier={currentUser?.username ?? ""}/>
                        <Badge pos={"absolute"} right={"-5px"} bottom={"-10px"}>
                            <Text size={"md"}>👋</Text>
                        </Badge>
                    </div>
                    <div>
                        <Text hierarchy={"primary"} size={"md"}>
                            Hi, @{currentUser?.username ?? "user"},
                        </Text>
                        <Text hierarchy={"tertiary"} size={"md"}>let's write some flows</Text>
                    </div>
                </Flex>
                <Spacing spacing={"xl"}/>
                <Row>
                    <Col xs={7}>
                        <Card>
                            <div style={{opacity: 0.2, overflow: "hidden", borderRadius: "inherit"}}>
                                <AuroraBackground/>
                            </div>
                            <PersonalProjectsView/>
                        </Card>
                    </Col>
                    <Col xs={5}>
                        <Card style={{boxShadow: "none"}}>
                            <OrganizationsTopView/>
                        </Card>
                    </Col>
                </Row>
                <Spacing spacing={"xl"}/>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation={"vertical"}>
                <ScrollAreaThumb/>
            </ScrollAreaScrollbar>
        </ScrollArea>


    </div>

}