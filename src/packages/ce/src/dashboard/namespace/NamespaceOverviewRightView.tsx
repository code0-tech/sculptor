"use client"

import React from "react";
import {
    AuroraBackground,
    Avatar,
    Badge,
    Button,
    DRuntimeList,
    Flex,
    Spacing,
    Text,
    Tooltip,
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {MemberService} from "@edition/member/Member.service";
import {useParams} from "next/navigation";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {UserService} from "@edition/user/User.service";
import Link from "next/link";

export const NamespaceOverviewRightView: React.FC = () => {

    const params = useParams()
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const namespaceId = params.namespaceId as any as number
    const namespace = React.useMemo(() => namespaceService.getById(`gid://sagittarius/Namespace/${namespaceId}`), [namespaceStore, namespaceId])
    const members = React.useMemo(() => memberService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceId}`}), [memberStore, userStore])

    return <Flex maw={"250px"} style={{flexDirection: "column"}}>
        <Button color={"primary"} w={"100%"}>
            Upgrade to <Badge border>Team</Badge>
            <AuroraBackground/>
        </Button>
        <Spacing spacing={"xl"}/>
        <Text>This is your personal space where you can manage your projects, roles, runtimes and invite outside
            users.</Text>
        <Spacing spacing={"xl"}/>
        <Text size={"md"}>Members</Text>
        <Spacing spacing={"xs"}/>
        <Flex align={"center"} style={{flexWrap: "wrap", gap: ".35rem"}}>
            {members.map(member => {
                const user = userService.getById(member.user?.id!!)
                return <Tooltip>
                    <TooltipTrigger asChild>
                        <Avatar identifier={user?.username ?? ""}/>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side={"bottom"} sideOffset={8}>
                            <Flex style={{flexDirection: "column"}}>
                                <Text size={"md"} hierarchy={"secondary"}>
                                    {user?.username}
                                </Text>
                                <Text size={"xs"} hierarchy={"tertiary"}>
                                    {user?.email}
                                </Text>
                            </Flex>
                            <TooltipArrow/>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            })}
            <Link href={`/namespace/${namespaceId}/members/add`}>
                <Button paddingSize={"xxs"}>Invite user</Button>
            </Link>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Text size={"md"}>Runtimes</Text>
        <Spacing spacing={"xs"}/>
        <DRuntimeList minimized namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    </Flex>

}