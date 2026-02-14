"use client"

import {Flex, Spacing, Text} from "@code0-tech/pictor";
import React from "react";
import {useRouter} from "next/navigation";
import {OrganizationDataTableComponent} from "@edition/organization/components/OrganizationDataTableComponent";

export const OrganizationsTopView = () => {

    const router = useRouter()

    return <>
        <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
            <Text size={"xl"} hierarchy={"primary"}>
                Top organizations
            </Text>
            <Text size={"sm"} hierarchy={"tertiary"}>
                Manage organizations that you belong to. You can create new organizations and switch between them.
            </Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        {/**TODO: use namespaceId*/}
        <OrganizationDataTableComponent minimized sort={{
            "updatedAt": "desc"
        }} preFilter={(_, index) => index < 5} onSelect={(organization) => {
            const number = organization?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
            router.push(`/namespace/${number}`)
        }}/>
    </>

}