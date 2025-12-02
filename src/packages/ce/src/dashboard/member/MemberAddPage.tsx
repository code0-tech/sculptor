"use client"

import React from "react";
import {Button, Col, DUserInput, Flex, Spacing, Text, useService} from "@code0-tech/pictor";
import {MemberService} from "@edition/member/Member.service";
import {useParams, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import Link from "next/link";

export const MemberAddPage: React.FC = () => {

    const params = useParams()
    const memberService = useService(MemberService)
    const router = useRouter()
    const [, startTransition] = React.useTransition()

    const namespaceIndex = params?.namespaceId as string
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex as unknown as number}`

    return <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
        <Col xs={4}>
            <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                Add new members
            </Text>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                Global runtimes are shared runtimes that can be used across multiple organizations.
            </Text>
            <Spacing spacing={"xl"}/>
            <DUserInput title={"Description"}
                        description={"Provide a simple project description"}/>
            <Spacing spacing={"xl"}/>
            <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                <Link href={"/"}>
                    <Button color={"primary"}>
                        Go back to members
                    </Button>
                </Link>
                <Button color={"success"}>
                    Add members
                </Button>
            </Flex>
        </Col>
    </Flex>
}