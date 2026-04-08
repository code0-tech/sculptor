"use client"

import React from "react";
import {AuroraBackground, Button, ButtonGroup, Flex, Spacing, Text} from "@code0-tech/pictor";
import Link from "next/link";
import {LicensesDataTableComponent} from "@edition/namespace/components/LicensesDataTableComponent";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";

export const LicensesView: React.FC = () => {

    const params = useParams()
    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Licenses
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage members that belong to this namespace. You can add new members and manage their permissions.
                </Text>
            </Flex>
            <ButtonGroup>
                <Link href={"https://codezero.build/subscription"}>
                    <Button color={"secondary"} variant={"none"}>
                        Link bought license
                    </Button>
                </Link>
                <Link href={"https://codezero.build/subscription"}>
                    <Button color={"secondary"} variant={"none"}>
                        <AuroraBackground/>
                        Buy new license
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xl"}/>
        <LicensesDataTableComponent namespaceId={namespaceId}/>
    </>
}