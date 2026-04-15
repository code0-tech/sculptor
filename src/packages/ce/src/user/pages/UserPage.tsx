"use client"

import React from "react";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {useParams} from "next/navigation";
import {
    AuroraBackground,
    Avatar,
    Badge,
    Button,
    Col,
    Flex,
    ScrollArea,
    ScrollAreaViewport,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {User} from "@code0-tech/sagittarius-graphql-types";
import {IconMail, IconSparkles, IconUser} from "@tabler/icons-react";

export const UserPage: React.FC = () => {


    const params = useParams()
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const userIndex = params.userId as any as number
    const userId: User['id'] = `gid://sagittarius/User/${userIndex}`

    const currentSession = useUserSession()
    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const user = React.useMemo(
        () => userService.getById(userId),
        [userStore, userId, userService]
    )


    const leftContent = <ScrollArea h={"100%"} type={"scroll"}>
        <ScrollAreaViewport>
            <Flex pr={0.7} miw={"17vw"} style={{flexDirection: "column"}}>
                <div style={{position: "relative"}}>
                    <Avatar type={"character"} size={150} identifier={user?.username!}/>
                    <Badge pos={"absolute"} right={"20%"} bottom={"20%"}>
                        <Text size={"md"}>👋</Text>
                    </Badge>
                </div>
                <Spacing spacing={"xs"}/>
                <Text size={"xl"} hierarchy={"primary"}>{user?.firstname} {user?.lastname}</Text>
                <Spacing spacing={"xs"}/>
                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconUser size={16}/>
                        @{user?.username}
                    </Text>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconMail size={16}/>
                        {user?.email}
                    </Text>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconSparkles size={16}/>
                        <Badge color={"primary"}>BASIC</Badge>
                    </Text>
                </Flex>
                <Spacing spacing={"xs"}/>
                {currentUser?.id === userId && (
                    <>
                        <Spacing spacing={"xs"}/>
                        <Button w={"100%"} color={"tertiary"}>Edit Profile</Button>
                        <Spacing spacing={"xs"}/>
                        <Button color={"primary"} w={"100%"}>
                            Upgrade to Pro
                            <AuroraBackground/>
                        </Button>
                    </>
                )}
            </Flex>
        </ScrollAreaViewport>
    </ScrollArea>

    return <Layout showLayoutSplitter={false} layoutGap={"0"} leftContent={leftContent}>
        <div style={{
            background: "#070514",
            height: "100%",
            padding: "1rem",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem"
        }}>
            <Flex h={"100%"} w={"100%"} align={"center"} justify={"center"}>
                <Col xs={4} style={{textAlign: "center"}}>
                    <Text size={"xl"} hierarchy={"primary"}>
                        @{user?.username}'s readme
                    </Text>
                    <Spacing spacing={"xs"}/>
                    <Text>
                        The user currently does not have a publicly available profile description.
                    </Text>
                </Col>
            </Flex>
        </div>
    </Layout>
}

