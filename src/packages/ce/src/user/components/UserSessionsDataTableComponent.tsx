"use client"

import React from "react";
import {
    DataTable,
    DataTableColumn,
    ScrollArea,
    ScrollAreaScrollbar, ScrollAreaThumb,
    ScrollAreaViewport,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {User, UserSession} from "@code0-tech/sagittarius-graphql-types";
import {UserService} from "@edition/user/services/User.service";
import {UserSessionsDataTableRowComponent} from "@edition/user/components/UserSessionsDataTableRowComponent";

export interface UserSessionsDataTableComponentProps {
    userId: User['id']
}

export const UserSessionsDataTableComponent: React.FC<UserSessionsDataTableComponentProps> = (props) => {

    const {userId} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const sessions = React.useMemo(
        () => (userService.getById(userId)?.sessions?.nodes ?? []).filter((session): session is UserSession => !!session && !!session.active),
        [userStore, userId]
    )

    return <ScrollArea w={"100%"} h={"100%"} type={"scroll"}>
        <ScrollAreaViewport>
            <DataTable filter={{}}
                       sort={{}}
                       emptyComponent={<DataTableColumn>
                           <Text>No sessions found for this user.</Text>
                       </DataTableColumn>}
                       data={sessions}>
                {(session) => <UserSessionsDataTableRowComponent userId={userId} sessionId={session.id}/>}
            </DataTable>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation={"vertical"}>
            <ScrollAreaThumb/>
        </ScrollAreaScrollbar>
    </ScrollArea>
}
