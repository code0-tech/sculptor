"use client"

import React from "react";
import {Button, DRuntimeList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";

export const RuntimesPage: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number

    const router = useRouter()
    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Runtimes
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={namespaceId ? `/namespace/${namespaceId}/runtimes/create` : "/runtimes/create"}>
                    <Button color={"success"}>Create runtime</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <DRuntimeList namespaceId={namespaceId ? `gid://sagittarius/Namespace/${namespaceId}` : undefined}
                      filter={(runtime) => namespaceId ? true : !runtime?.namespace?.id} onSetting={(runtime) => {
            const number = runtime.id?.match(/Runtime\/(\d+)$/)?.[1]
            router.push(namespaceId ? `/namespace/${namespaceId}/runtimes/${number}/settings` : `/runtimes/${number}/settings`)
        }}/>
    </>
}