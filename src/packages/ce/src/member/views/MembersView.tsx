"use client"

import React from "react";
import {useParams} from "next/navigation";
import {Button, DNamespaceMemberList, Flex, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import Link from "next/link";
import {MemberService} from "@edition/member/services/Member.service";
import {MemberDataTableComponent} from "@edition/member/components/MemberDataTableComponent";

//TODO: user abilities for add user as member within namespace
export const MembersView: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Members
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={`/namespace/${namespaceId}/members/add`}>
                    <Button color={"success"}>Add user</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <MemberDataTableComponent namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>

    </>

}