import React from "react";
import {
    Flex,
    TagInput,
    TagInputMenu,
    TagInputMenuItem,
    TagInputProps,
    TagInputTrigger,
    TagInputValue,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {User} from "@code0-tech/sagittarius-graphql-types";

export interface UserInputComponentProps extends TagInputProps {
    filter?: (user: User, index: number) => boolean
}

export const UserInputComponent: React.FC<UserInputComponentProps> = (props) => {

    const {filter = () => true, ...rest} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const users = React.useMemo(
        () => userService.values().filter(filter),
        [userStore]
    )

    return <TagInput allowCustomValues={false} placeholder={"Enter users"} {...rest}>
        <TagInputMenu>
            {users.map(user => (
                <TagInputMenuItem key={user.id} onlyOnce value={user.username || ""} data={user}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <Text>{user.username}</Text>
                        <Text size={"xs"} hierarchy={"tertiary"}>{user.email}</Text>
                    </Flex>
                </TagInputMenuItem>
            ))}
        </TagInputMenu>
        <TagInputValue onKeyUp={e => {
            const token = (e.currentTarget.textContent ?? "").split(/\s+/).pop()
            if (token) userService.getByUsername(token)
        }}/>
        <TagInputTrigger/>
    </TagInput>
}
