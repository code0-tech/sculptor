"use client"

import React from "react";
import {Button, DRuntimeList, Flex, Spacing, Text, useService, useStore, useUserSession} from "@code0-tech/pictor";
import Link from "next/link";
import {notFound, useParams, useRouter} from "next/navigation";
import {UserService} from "@edition/user/User.service";

export const RuntimesPage: React.FC = () => {

    const currentSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])

    const params = useParams()
    const namespaceIndex = params.namespaceId as any as number

    if (!namespaceIndex && currentUser && !currentUser.admin) {
        notFound()
    }

    const router = useRouter()
    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Runtimes
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={namespaceIndex ? `/namespace/${namespaceIndex}/runtimes/create` : "/runtimes/create"}>
                    <Button color={"success"}>Create runtime</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <DRuntimeList namespaceId={namespaceIndex ? `gid://sagittarius/Namespace/${namespaceIndex}` : undefined}
                      filter={(runtime) => namespaceIndex ? true : !runtime?.namespace?.id} onSetting={(runtime) => {
            const number = runtime.id?.match(/Runtime\/(\d+)$/)?.[1]
            router.push(namespaceIndex ? `/namespace/${namespaceIndex}/runtimes/${number}/settings` : `/runtimes/${number}/settings`)
        }}/>
    </>
}