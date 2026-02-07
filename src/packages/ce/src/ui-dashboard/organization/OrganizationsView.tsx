"use client"

import {Button, DOrganizationList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import {useRouter} from "next/navigation";

export const OrganizationsView = () => {

    const router = useRouter()

    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Organizations
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage organizations that you belong to. You can create new organizations and switch between them.
                </Text>
            </Flex>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={"/organizations/create"}>
                    <Button color={"success"}>Create</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        {/**TODO: use namespaceId*/}
        <DOrganizationList color={"secondary"} onSelect={(organization) => {
            const number = organization.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
            router.push(`/namespace/${number}`)
        }}/>
    </>

}