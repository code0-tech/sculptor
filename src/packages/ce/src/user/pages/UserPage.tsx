"use client"

import React from "react";
import {useParams} from "next/navigation";
import {
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
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {User} from "@code0-tech/sagittarius-graphql-types";

export const UserPage: React.FC = () => {

    const params = useParams()
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const sessionUser = currentSession?.user

    const userIndex = decodeURIComponent(String(params.userId ?? ""))
    const userId: User['id'] = userIndex === "@me"
        ? sessionUser?.id!
        : `gid://sagittarius/User/${userIndex as any as number}`

    const user = React.useMemo(
        () => userService.getById(userId) ?? (userId === sessionUser?.id ? sessionUser : undefined),
        [userStore, userId, userService, sessionUser]
    )

    const readme = user?.readme?.trim()

    return <div style={{
        background: "var(--primary)",
        height: "100%",
        position: "relative",
        boxSizing: "border-box",
        borderRadius: "1rem",
        padding: "1rem",
    }}>
        <ScrollArea h={"100%"} type={"scroll"}>
            <ScrollAreaViewport>
                {readme ? (
                    <div style={{maxWidth: "48rem", margin: "0 auto", padding: "3rem 1rem"}}>
                        <Text hierarchy={"tertiary"}>Readme</Text>
                        <Spacing spacing={"md"}/>
                        <Text size={"md"} hierarchy={"secondary"}
                              style={{whiteSpace: "pre-wrap", lineHeight: 1.8}}>
                            {readme}
                        </Text>
                    </div>
                ) : (
                    <Flex h={"100%"} align={"center"} justify={"center"}
                          style={{flexDirection: "column", minHeight: "70vh", textAlign: "center"}}>
                        <Text size={"lg"} hierarchy={"secondary"}>
                            @{user?.username} hasn't written a readme yet
                        </Text>
                        <Spacing spacing={"xs"}/>
                        <Text size={"sm"} hierarchy={"tertiary"}>
                            When they add a profile description, it'll show up here.
                        </Text>
                    </Flex>
                )}
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation={"vertical"}>
                <ScrollAreaThumb/>
            </ScrollAreaScrollbar>
        </ScrollArea>
    </div>
}
