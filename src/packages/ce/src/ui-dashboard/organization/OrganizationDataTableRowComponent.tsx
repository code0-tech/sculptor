import React from "react";
import {Organization} from "@code0-tech/sagittarius-graphql-types";
import {
    Avatar,
    Badge,
    Button,
    DataTableColumn,
    DOrganizationView,
    Flex,
    Text,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {IconLogout} from "@tabler/icons-react";
import {OrganizationService} from "@edition/organization/Organization.service";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {MemberService} from "@edition/member/Member.service";
import {UserService} from "@edition/user/User.service";
import {hashToColor} from "@code0-tech/pictor/dist/components/d-flow/DFlow.util";
import {formatDistanceToNow} from "date-fns";

export interface OrganizationDataTableRowComponentProps {
    organizationId: Organization['id']
    onLeave?: (organization: DOrganizationView) => void
}

export const OrganizationDataTableRowComponent: React.FC<OrganizationDataTableRowComponentProps> = (props) => {

    const {organizationId, onLeave} = props

    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const namespaceStore = useStore(NamespaceService)
    const namespaceService = useService(NamespaceService)
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const organization = React.useMemo(
        () => organizationService.getById(organizationId),
        [organizationStore, organizationId]
    )

    const namespace = React.useMemo(
        () => organization ? namespaceService.getById(organization.namespace?.id) : null,
        [namespaceStore, organization]
    )

    const namespaceMember = React.useMemo(
        () => namespace && currentUser ? memberService.getByNamespaceIdAndUserId(namespace.id, currentUser.id) : null,
        [memberStore, namespace, currentUser]
    )

    const namespaceMembers = React.useMemo(
        () => memberService.values({namespaceId: namespace?.id}),
        [memberStore, userStore, namespace]
    )

    return <>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "1rem"}}>
                <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                    <Flex align={"center"} style={{gap: "0.7rem"}}>
                        <Avatar bg={"transparent"}
                                color={hashToColor("organization")}
                                identifier={organization?.name ?? ""}/>
                        <Text size={"md"} hierarchy={"primary"}>
                            {organization?.name}
                        </Text>
                    </Flex>
                    <Flex style={{gap: "0.35rem"}}>
                        {namespaceMembers.map(member => {
                            return <Badge color={"secondary"}>
                                <Avatar size={10} identifier={member.user?.username!}/>
                                <Text>
                                    @{member.user?.username}
                                </Text>
                            </Badge>
                        })}
                    </Flex>
                </Flex>
                <Text hierarchy={"tertiary"}>
                    Updated {formatDistanceToNow(organization?.updatedAt!)} ago
                </Text>
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Text hierarchy={"tertiary"}>
                        {namespace?.projects?.count ?? 0} {" "}
                        projects
                    </Text>
                    <Text hierarchy={"tertiary"}>
                        {namespace?.members?.count ?? 0}{" "}
                        members
                    </Text>
                    <Text hierarchy={"tertiary"}>
                        {namespace?.runtimes?.count ?? 0}{" "}
                        connected runtimes
                    </Text>
                </Flex>
            </Flex>
        </DataTableColumn>
        {onLeave && namespaceMember && namespaceMember.userAbilities?.deleteMember ? (
            <DataTableColumn>
                <Button variant={"filled"} color={"error"} onClick={(event) => {
                    event.stopPropagation()
                    if (organization) onLeave(organization)
                }}>
                    <IconLogout size={13}/> Leave
                </Button>
            </DataTableColumn>
        ) : null}
    </>
}