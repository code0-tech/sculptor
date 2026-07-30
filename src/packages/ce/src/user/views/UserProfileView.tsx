"use client"

import React from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {
    AuroraBackground,
    Avatar,
    Badge,
    Button,
    Flex,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {User} from "@code0-tech/sagittarius-graphql-types";
import {IconMail, IconSparkles, IconUser} from "@tabler/icons-react";

export const UserProfileView: React.FC = () => {

    const params = useParams()
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()
    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const sessionUser = currentSession?.user

    const userIndex = decodeURIComponent(String(params.userId ?? ""))
    const userId: User['id'] = userIndex === "@me"
        ? sessionUser?.id!
        : `gid://sagittarius/User/${userIndex as any as number}`

    const user = React.useMemo(
        () => userService.getById(userId) ?? (userId === sessionUser?.id ? sessionUser : undefined),
        [userStore, userId, userService, sessionUser]
    )

    const isCurrentUser = currentUser?.id === userId

    return <Flex h={"100%"} pt={0.5} pl={0.7} pr={0.7}
                 style={{boxSizing: "border-box", flexDirection: "column", gap: "1.3rem"}}>

        <Flex align={"center"} style={{gap: "0.7rem", minWidth: 0}}>
            <Avatar type={"character"} size={40} identifier={user?.username!}/>
            <Flex style={{flexDirection: "column", minWidth: 0}}>
                <Text size={"md"} hierarchy={"primary"}>
                    {user?.firstname} {user?.lastname}
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    @{user?.username}
                </Text>
            </Flex>
        </Flex>

        <div style={{borderTop: "1px dashed rgba(255,255,255, .1)"}}/>

        <Flex style={{flexDirection: "column", gap: "0.6rem"}}>
            <Text hierarchy={"tertiary"}>Details</Text>
            <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.6rem", minWidth: 0}}>
                <IconMail size={15}/>
                <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                    {user?.email}
                </span>
            </Text>
            <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.6rem"}}>
                <IconSparkles size={15}/>
                <Badge color={"primary"}>BASIC</Badge>
            </Text>
            <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.6rem"}}>
                <IconUser size={15}/>
                Member
            </Text>
        </Flex>

        {isCurrentUser && (
            <div style={{marginTop: "auto", display: "flex", flexDirection: "column"}}>
                <Link href={"/users/@me/settings"} style={{width: "100%"}}>
                    <Button w={"100%"} color={"tertiary"}>Edit Profile</Button>
                </Link>
                <Spacing spacing={"xs"}/>
                <Button color={"primary"} w={"100%"} disabled>
                    Upgrade to Pro
                    <AuroraBackground/>
                </Button>
            </div>
        )}
    </Flex>
}
