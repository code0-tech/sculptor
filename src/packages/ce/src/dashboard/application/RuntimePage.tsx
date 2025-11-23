"use client"

import React from "react";
import {Button, DRuntimeList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";
import {useRouter} from "next/navigation";

export const RuntimePage: React.FC = () => {

    const router = useRouter()

    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Global runtimes
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a global runtime..."}/>
                <Link href={"/runtimes/create"}>
                    <Button color={"success"}>Link Runtime</Button>
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