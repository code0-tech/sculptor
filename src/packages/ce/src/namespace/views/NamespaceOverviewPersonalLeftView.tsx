import React from "react";
import {
    AuroraBackground,
    Avatar,
    Badge,
    Button,
    Flex,
    hashToColor,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {IconMail, IconSparkles, IconUser, IconUserCog} from "@tabler/icons-react";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import Link from "next/link";
import {useParams} from "next/navigation";
import {MemberService} from "@edition/member/services/Member.service";

export const NamespaceOverviewPersonalLeftView: React.FC = () => {

    const params = useParams()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)

    const namespaceIndex = params.namespaceId as any as number

    const currentSession = useUserSession()
    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )
    const organizations = React.useMemo(
        () => organizationService.values(),
        [organizationStore]
    )

    const members = React.useMemo(
        () => memberService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceIndex}`}),
        [memberStore, userStore]
    )

    return <ScrollArea h={"100%"} type={"scroll"}>
        <ScrollAreaViewport>
            <Flex pr={0.7} miw={"17vw"} style={{flexDirection: "column"}}>
                <div style={{position: "relative"}}>
                    <Avatar type={"character"} size={150} identifier={currentUser?.username!!}/>
                    <Badge pos={"absolute"} right={"20%"} bottom={"20%"}>
                        <Text size={"md"}>👋</Text>
                    </Badge>
                </div>
                <Spacing spacing={"xs"}/>
                <Text size={"xl"} hierarchy={"primary"}>{currentUser?.firstname} {currentUser?.lastname}</Text>
                <Spacing spacing={"xs"}/>
                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconUser size={16}/>
                        @{currentUser?.username}
                    </Text>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconUserCog size={16}/>
                        {currentUser?.admin ? <Badge color={"secondary"}>Admin</Badge> :
                            <Badge color={"secondary"}>User</Badge>}
                    </Text>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconMail size={16}/>
                        {currentUser?.email}
                    </Text>
                    <Text display={"flex"} align={"center"} size={"sm"} style={{gap: "0.7rem"}}>
                        <IconSparkles size={16}/>
                        <Badge color={"primary"}>BASIC</Badge>
                    </Text>
                </Flex>
                <Spacing spacing={"xs"}/>
                <Button w={"100%"} color={"tertiary"}>Edit Profile</Button>
                <Spacing spacing={"xs"}/>
                <Button color={"primary"} w={"100%"}>
                    Upgrade to Pro
                    <AuroraBackground/>
                </Button>
                <Spacing spacing={"xs"}/>
                <hr style={{width: "100%"}} color={"#201e2c"}/>
                <Spacing spacing={"xs"}/>
                <Text size={"md"}>Organizations</Text>
                <Spacing spacing={"xs"}/>
                <Flex align={"center"} style={{flexWrap: "wrap", gap: ".35rem"}}>
                    {organizations.map(organization => {
                        return <Avatar key={organization.id}
                                       color={hashToColor(organization?.name ?? "", 200, 360)}
                                       identifier={organization.name ?? ""}/>
                    })}
                    {organizations.length <= 0 && <Text>You aren't a member of any organization</Text>}
                </Flex>
                <Spacing spacing={"xs"}/>
                <hr style={{width: "100%"}} color={"#201e2c"}/>
                <Spacing spacing={"xs"}/>
                <Text size={"md"}>Members</Text>
                <Spacing spacing={"xs"}/>
                <Flex align={"center"} style={{flexWrap: "wrap", gap: ".35rem"}}>
                    {members.map(member => {
                        const user = userService.getById(member.user?.id!!)
                        return <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar type={"character"} identifier={user?.username ?? ""}/>
                            </TooltipTrigger>
                            <TooltipPortal>
                                <TooltipContent side={"bottom"} sideOffset={8}>
                                    <Flex style={{flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"secondary"}>
                                            @{user?.username}
                                        </Text>
                                        <Text size={"xs"} hierarchy={"tertiary"}>
                                            {user?.email}
                                        </Text>
                                    </Flex>
                                </TooltipContent>
                            </TooltipPortal>
                        </Tooltip>
                    })}
                    {members.length <= 0 &&
                        <Link style={{width: "100%"}} href={`/namespace/${namespaceIndex}/members/add`}>
                            <Button color={"tertiary"} w={"100%"}>Invite first member</Button>
                        </Link>}
                </Flex>

            </Flex>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation={"vertical"}>
            <ScrollAreaThumb/>
        </ScrollAreaScrollbar>
    </ScrollArea>

}