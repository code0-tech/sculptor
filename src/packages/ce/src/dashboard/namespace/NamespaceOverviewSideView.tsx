"use client"

import React from "react";
import {
    Avatar, Badge,
    Button,
    DRuntimeCard,
    DRuntimeList,
    Flex,
    Spacing,
    Text,
    useService, useStore
} from "@code0-tech/pictor";
import {MemberService} from "@edition/member/Member.service";
import {useParams} from "next/navigation";
import {NamespaceService} from "@edition/namespace/Namespace.service";

export const NamespaceOverviewSideView: React.FC = () => {

    const params = useParams()
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceId = params.namespaceId as any as number
    const namespace = React.useMemo(() => namespaceService.getById(`gid://sagittarius/Namespace/${namespaceId}`), [namespaceStore, namespaceId])
    const members = React.useMemo(() => memberService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceId}`}), [memberStore])

    return <Flex maw={"250px"} style={{flexDirection: "column"}}>
        <Button color={"info"} w={"100%"}>
            Upgrade to <Badge>PRO</Badge>
        </Button>
        <Spacing spacing={"xs"}/>
        <hr style={{width: "100%"}} color={"#1c1a2c"}/>
        <Spacing spacing={"xs"}/>
        <Text>This is your personal space where you can manage your projects, roles, runtimes and invite outside
            users.</Text>
        <Spacing spacing={"xs"}/>
        <hr style={{width: "100%"}} color={"#1c1a2c"}/>
        <Spacing spacing={"xs"}/>
        <Text size={"md"}>Members</Text>
        <Spacing spacing={"xs"}/>
        <Flex align={"center"} style={{flexWrap: "wrap", gap: ".35rem"}}>
            {members.map(member => {
                return <Avatar identifier={member.user?.id!!}/>
            })}
            <Button paddingSize={"xxs"}>Invite user</Button>
        </Flex>
        <Spacing spacing={"xs"}/>
        <hr style={{width: "100%"}} color={"#1c1a2c"}/>
        <Spacing spacing={"xs"}/>
        <Text size={"md"}>Runtimes</Text>
        <Spacing spacing={"xs"}/>
        <DRuntimeList minimized namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    </Flex>

}