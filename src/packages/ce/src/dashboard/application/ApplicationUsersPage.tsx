"use client"

import React from "react";
import {
    Avatar,
    Badge,
    Button,
    Card,
    DUserView,
    Flex,
    Spacing,
    Text,
    TextInput,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {IconMailCheck, IconSearch} from "@tabler/icons-react";
import {UserService} from "@edition/user/User.service";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";

export const ApplicationUsersPage: React.FC = () => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const users = React.useMemo(() => userService.values(), [userStore])
    const usersList = React.useMemo(() => {
        return users.map((user) => {
            return <UserCardSection user={user} key={user.id}/>
        })
    }, [users])

    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Users
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a user..."}/>
                <Button color={"success"}>Invite user</Button>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Card>
            {usersList}
        </Card>

    </>
}

const UserCardSection: React.FC<{ user: DUserView }> = (props) => {

    const {user} = props
    const [remove, setRemove] = React.useState(false)
    const currentSession = useUserSession()
    const isCurrentUser = currentSession?.user?.id === user.id
    const userService = useService(UserService)
    const [, startTransition] = React.useTransition()

    return <CardSection border>
        <Flex justify={"space-between"} align={"center"}>
            <Flex style={{gap: ".7rem"}} align={"center"}>
                <Avatar identifier={user.username!!} bg={"transparent"}/>
                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <Text size={"md"} hierarchy={"primary"}>{user.username}</Text>
                        {user.admin ? <Badge color={"secondary"}>Admin</Badge> : null}
                    </Flex>
                    <Text size={"md"} hierarchy={"tertiary"}>{user.email}</Text>
                </Flex>
            </Flex>
            <Flex style={{gap: "1.3rem"}} align={"center"}>
                {user.emailVerifiedAt ? (
                    <Text display={"inline-flex"}
                          align={"center"}
                          style={{gap: "0.35rem"}}>
                        <IconMailCheck size={18}/> Email verified
                    </Text>
                ) : null}
                {!isCurrentUser ? (
                    <Flex style={{gap: "0.7rem"}} align={"center"}>
                        <Button color={"error"}>Block</Button>
                        {
                            remove ? (
                                <Flex align={"center"} style={{gap: "0.35rem"}}>
                                    <Button color={"error"} onClick={() => {
                                        startTransition(async () => {
                                            userService.deleteById(user.id)
                                            userService.update()
                                        })
                                    }}>
                                        Confirm remove
                                    </Button>
                                    <Button onClick={() => setRemove(false)} color={"success"}>
                                        Cancel
                                    </Button>
                                </Flex>
                            ) : (
                                <Button onClick={() => setRemove(true)}>
                                    Remove
                                </Button>)
                        }
                    </Flex>
                ) : null}
            </Flex>
        </Flex>
    </CardSection>
}