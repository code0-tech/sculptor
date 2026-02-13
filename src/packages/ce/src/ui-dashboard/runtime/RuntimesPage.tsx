"use client"

import React from "react";
import {Button, DRuntimeList, Flex, Spacing, Text, useService, useStore, useUserSession} from "@code0-tech/pictor";
import Link from "next/link";
import {notFound, useParams, useRouter} from "next/navigation";
import {UserService} from "@edition/user/User.service";
import {RuntimeDataTableComponent} from "@edition/ui-dashboard/runtime/RuntimeDataTableComponent";

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
    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Runtimes
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage runtimes that you have access to. Runtimes are the environments where your applications run.
                </Text>
            </Flex>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={namespaceIndex ? `/namespace/${namespaceIndex}/runtimes/create` : "/runtimes/create"}>
                    <Button color={"success"}>Create</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <RuntimeDataTableComponent namespaceId={namespaceIndex ? `gid://sagittarius/Namespace/${namespaceIndex}` : undefined}
                      preFilter={(runtime) => namespaceIndex ? true : !runtime?.namespace?.id} onSelect={(runtime) => {
            const number = runtime?.id?.match(/Runtime\/(\d+)$/)?.[1]
            router.push(namespaceIndex ? `/namespace/${namespaceIndex}/runtimes/${number}/settings` : `/runtimes/${number}/settings`)
        }}/>
    </div>
}