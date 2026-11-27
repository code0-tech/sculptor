import React from "react";
import "./UserInputComponent.style.scss"
import {
    Badge,
    Flex,
    MenuItem,
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
import {useDebouncedCallback} from "use-debounce";
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

    const lookupUsername = useDebouncedCallback((username: string) => {
        userService.getByUsername(username)
    }, 400)

    const tokenRules = React.useMemo(() => [{
        pattern: /.+/,
        wrap: (username: string) => <Badge m={0.01}>
            <Flex align={"center"} style={{gap: "0.35rem"}}>
                <Text>{username}</Text>
                <Text size={"xs"} hierarchy={"tertiary"}>
                    {users.find(user => user.username === username)?.email}
                </Text>
            </Flex>
        </Badge>
    }], [users])

    return <TagInput allowCustomValues={false}
                     placeholder={"Type to search by username or email"}
                     tokenRules={tokenRules}
                     {...rest}
                     className={["user-input", rest.className].filter(Boolean).join(" ")}>
        <TagInputMenu openOn={"focus"} className={"user-input__menu"}>
            <MenuItem disabled className={"user-input__menu-empty"}>
                <Text hierarchy={"tertiary"}>
                    {users.length <= 0 ? "No users left to add" : "No users found"}
                </Text>
            </MenuItem>
            {users.map(user => (
                <TagInputMenuItem key={user.id} onlyOnce value={user.username || ""} data={user}
                                  aliases={user.email ? [user.email] : undefined}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <Text>{user.username}</Text>
                        <Text size={"xs"} hierarchy={"tertiary"}>{user.email}</Text>
                    </Flex>
                </TagInputMenuItem>
            ))}
        </TagInputMenu>
        <TagInputValue onKeyDownCapture={event => {
            if (event.key !== "Enter" || !event.shiftKey) return
            event.preventDefault()
            event.stopPropagation()
        }} onInput={event => {
            const typed = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-slate-string]"))
                .filter(leaf => !leaf.closest(".editor-input__token"))
                .map(leaf => leaf.textContent ?? "")
                .join("")
                .replace(/[​﻿]/g, "")
                .trim()
            if (typed.length >= 3) lookupUsername(typed)
        }}/>
        <TagInputTrigger/>
    </TagInput>
}
