"use client"

import React from "react";
import {NamespacesView} from "@edition/namespace/views/NamespacesView";
import {
    AuroraBackground,
    Avatar,
    Badge,
    Button,
    Flex,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconMail, IconSparkles, IconUser} from "@tabler/icons-react";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";

export const NamespacesPage = () => {


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
                    <NamespacesView/>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation={"vertical"}>
                    <ScrollAreaThumb/>
                </ScrollAreaScrollbar>
            </ScrollArea>
        </div>
    </Layout>

}
