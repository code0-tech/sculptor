"use client"

import React from "react";
import {useParams} from "next/navigation";
import {Button, DNamespaceMemberList, Flex, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import Link from "next/link";
import {MemberService} from "@edition/member/services/Member.service";

export const MembersView: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const [, startTransition] = React.useTransition()

    const membersList = React.useMemo(() => {
        return <DNamespaceMemberList color={"secondary"} onAssignRole={(member, roles) => {
            startTransition(() => {
                memberService.memberAssignRoles({
                    memberId: member.id!,
                    roleIds: roles.map(r => r.id!)
                })
            })
        }} onRemove={(member) => {
            startTransition(() => {
                memberService.memberDelete({
                    namespaceMemberId: member.id!
                })
            })
        }} namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    }, [namespaceId, memberStore])

    //TODO: user abilities for add user as member within namespace

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
        {membersList}

    </>

}