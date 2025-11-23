"use client"

import React from "react";
import {
    Button,
    DRuntimeList,
    Flex,
    Spacing,
    Text,
    TextInput,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";
import {notFound, useRouter} from "next/navigation";
import {UserService} from "@edition/user/User.service";

export const RuntimesPage: React.FC = () => {

    const router = useRouter()
    const currentSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])

    if (currentUser && !currentUser.admin) {
        return notFound()
    }

    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Global runtimes
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a global runtime..."}/>
                <Link href={"/runtimes/create"}>
                    <Button color={"success"}>Create global runtime</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <DRuntimeList onSetting={(runtimeId) => {
            const number = runtimeId?.match(/Runtime\/(\d+)$/)?.[1]
            router.push(`/runtimes/${number}/settings`)
        }}/>
    </>
}