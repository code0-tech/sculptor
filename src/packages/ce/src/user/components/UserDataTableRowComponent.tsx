import React, {startTransition} from "react";
import {User} from "@code0-tech/sagittarius-graphql-types";
import {
    Avatar,
    Badge,
    Button,
    DataTableColumn, Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTrigger,
    Flex,
    Menu, MenuContent, MenuPortal,
    MenuTrigger, Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {formatDistanceToNow} from "date-fns";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {IconDotsVertical, IconX} from "@tabler/icons-react";

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

    const userDelete = React.useCallback(() => {
        if (!userId) return
        startTransition(() => {
            userService.userDelete({
                userId: userId
            })
        })
    }, [userId, userService])

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
        <DataTableColumn>
            {user?.userAbilities?.deleteUser ? (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button color="error">
                            <IconX size={16}/>
                        </Button>
                    </DialogTrigger>
                    <DialogPortal>
                        <DialogOverlay/>
                        <DialogContent showCloseButton title={"Remove user permanently"}>
                            <Spacing spacing={"xl"}/>
                            <Text size={"md"} hierarchy={"secondary"}>
                                Are you sure you want to remove {" "}
                                <Badge color={"info"}>
                                    <Text size={"md"} style={{color: "inherit"}}>@{user?.username}</Text>
                                </Badge>?
                            </Text>
                            <Spacing spacing={"xl"}/>
                            <Flex justify={"space-between"} align={"center"}>
                                <DialogClose asChild>
                                    <Button color={"tertiary"}>No, go back!</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button color={"error"} onClick={userDelete}>Yes, remove!</Button>
                                </DialogClose>
                            </Flex>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>

            ) : null}
        </DataTableColumn>
    </>
}