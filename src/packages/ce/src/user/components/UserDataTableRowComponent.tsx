import React from "react";
import {User} from "@code0-tech/sagittarius-graphql-types";
import {Avatar, Badge, DataTableColumn, Flex, hashToColor, Text, useService, useStore} from "@code0-tech/pictor";
import {formatDistanceToNow} from "date-fns";
import {UserService} from "@edition/user/services/User.service";

export interface UserDataTableRowComponentProps {
    userId: User['id']
}

export const UserDataTableRowComponent: React.FC<UserDataTableRowComponentProps> = (props) => {

    const {userId} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const user = React.useMemo(
        () => userService.getById(userId),
        [userStore, userId]
    )

    return <>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Avatar size={32}
                            type={"character"}
                            identifier={user?.username ?? ""}/>
                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                            <Text size={"md"} hierarchy={"primary"}>
                                @{user?.username}
                            </Text>
                            {user?.admin ? <Badge color={"secondary"}>Owner</Badge> : null}
                        </Flex>
                        <Text>
                            {user?.email ?? ""}
                        </Text>
                    </Flex>
                </Flex>
                <Text hierarchy={"tertiary"}>
                    Account created {formatDistanceToNow(user?.createdAt!)} ago
                </Text>
            </Flex>
        </DataTableColumn>
    </>
}