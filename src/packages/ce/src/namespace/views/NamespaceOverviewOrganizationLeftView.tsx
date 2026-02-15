import React from "react";
import {
    AuroraBackground,
    Avatar,
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
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import Link from "next/link";
import {useParams} from "next/navigation";
import {MemberService} from "@edition/member/services/Member.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {RuntimeDataTableComponent} from "@edition/runtime/components/RuntimeDataTableComponent";

export const NamespaceOverviewOrganizationLeftView: React.FC = () => {

    const params = useParams()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceIndex = params.namespaceId as any as number

    const namespace = React.useMemo(
        () => namespaceService.getById(`gid://sagittarius/Namespace/${namespaceIndex}`),
        [namespaceStore, namespaceIndex]
    )
    const parentOrganization = React.useMemo(
        () => namespace?.parent?.__typename === "Organization" ? organizationService.getById(namespace?.parent?.id) : null,
        [organizationStore, namespace]
    )

    const members = React.useMemo(
        () => memberService.values({namespaceId: `gid://sagittarius/Namespace/${namespaceIndex}`}),
        [memberStore, userStore]
    )

    return <ScrollArea h={"100%"} type={"scroll"}>
        <ScrollAreaViewport>
            <Flex pr={0.7} miw={"17vw"} style={{flexDirection: "column"}}>
                <Avatar size={150}
                        color={hashToColor(parentOrganization?.name ?? "", 200, 360)}
                        identifier={parentOrganization?.name!!}/>
                <Spacing spacing={"xs"}/>
                <Text size={"xl"} hierarchy={"primary"}>{parentOrganization?.name}</Text>
                <Spacing spacing={"xs"}/>
                <Button w={"100%"} color={"tertiary"}>Edit Organization</Button>
                <Spacing spacing={"xs"}/>
                <Button color={"primary"} w={"100%"}>
                    Upgrade to Team
                    <AuroraBackground/>
                </Button>
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
                <Spacing spacing={"xs"}/>
                <hr style={{width: "100%"}} color={"#201e2c"}/>
                <Spacing spacing={"xs"}/>
                <Text size={"md"}>Runtimes</Text>
                <Spacing spacing={"xs"}/>
                <RuntimeDataTableComponent namespaceId={`gid://sagittarius/Namespace/${namespaceIndex}`} minimized/>
            </Flex>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation={"vertical"}>
            <ScrollAreaThumb/>
        </ScrollAreaScrollbar>
    </ScrollArea>

}