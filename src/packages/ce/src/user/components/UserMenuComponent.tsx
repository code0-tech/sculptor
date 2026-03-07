"use client"

import React from "react"
import {Scalars} from "@code0-tech/sagittarius-graphql-types";
import {
    Avatar,
    Flex,
    Menu,
    MenuContent,
    MenuPortal,
    MenuProps,
    MenuTrigger,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";

export interface UserMenuComponentProps extends MenuProps {
    userId: Scalars['UserID']['output']
}

const UserMenuComponent: React.FC<UserMenuComponentProps> = props => {
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentUser = React.useMemo(() => userService.getById(props.userId), [userStore, userService])

    return React.useMemo(() => {
        return (
            <Menu {...props}>
                <MenuTrigger asChild>
                    <Flex align={"center"} style={{gap: ".5rem"}}>
                        <Avatar src={currentUser?.avatarPath ?? ""} type={"character"}
                                identifier={currentUser?.username ?? ""}/>
                        <Flex style={{flexDirection: "column"}}>
                            <Text size={"md"} hierarchy={"secondary"}>
                                {currentUser?.username}
                            </Text>
                            <Text size={"xs"} hierarchy={"tertiary"}>
                                {currentUser?.email}
                            </Text>
                        </Flex>

                    </Flex>
                </MenuTrigger>
                <MenuPortal>
                    <MenuContent side={"bottom"} align={"start"} sideOffset={8}>
                        {props.children}
                    </MenuContent>
                </MenuPortal>
            </Menu>
        )
    }, [currentUser])
}

export default UserMenuComponent