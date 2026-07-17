"use client"

import React from "react";
import {User, UserSession} from "@code0-tech/sagittarius-graphql-types";
import {Button, DataTableColumn, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {formatDistanceToNow} from "date-fns";
import {IconDeviceDesktop, IconLogout} from "@tabler/icons-react";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

export interface UserSessionsDataTableRowComponentProps {
    userId: User['id']
    sessionId: UserSession['id']
}

export const UserSessionsDataTableRowComponent: React.FC<UserSessionsDataTableRowComponentProps> = (props) => {

    const {userId, sessionId} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentSession = useUserSession()

    const session = React.useMemo(
        () => userService.getById(userId)?.sessions?.nodes?.find(session => session?.id === sessionId) as UserSession | undefined,
        [userStore, userId, sessionId]
    )

    const isCurrent = !!sessionId && sessionId === currentSession?.id

    const logout = React.useCallback(() => {
        if (!sessionId) return
        userService.usersLogout({userSessionId: sessionId}).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                addIslandSuccessNotification({
                    message: "Logged out session"
                })
            }
        })
    }, [sessionId])

    if (!session) return null

    return <>
        <DataTableColumn pr={2.5}>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <IconDeviceDesktop size={16}/>
                <Flex style={{flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        {isCurrent ? "This device" : "Session"}
                    </Text>
                    {session.createdAt && (
                        <Text size={"xs"} hierarchy={"tertiary"}>
                            Created {formatDistanceToNow(new Date(session.createdAt), {addSuffix: true})}
                        </Text>
                    )}
                </Flex>

            </Flex>
        </DataTableColumn>
        <DataTableColumn pr={2.5}>
            {session.updatedAt && (
                <Text hierarchy={"tertiary"}>
                    Last used {formatDistanceToNow(new Date(session.updatedAt), {addSuffix: true})}
                </Text>
            )}
        </DataTableColumn>
        <DataTableColumn>
            <Button p={0.5} color={"secondary"} variant={"none"} onClick={logout}>
                <IconLogout size={16}/>
            </Button>
        </DataTableColumn>
    </>
}
