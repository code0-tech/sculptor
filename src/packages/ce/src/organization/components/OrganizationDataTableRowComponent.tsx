import React from "react";
import {Organization} from "@code0-tech/sagittarius-graphql-types";
import {
    Avatar,
    Button,
    DataTableColumn,
    DOrganizationView,
    Flex,
    hashToColor,
    Text,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {IconLogout} from "@tabler/icons-react";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {MemberService} from "@edition/member/services/Member.service";
import {UserService} from "@edition/user/services/User.service";
import {formatDistanceToNow} from "date-fns";

export interface OrganizationDataTableRowComponentProps {
    organizationId: Organization['id']
    onLeave?: (organization: DOrganizationView) => void
    minimized?: boolean
}

export const OrganizationDataTableRowComponent: React.FC<OrganizationDataTableRowComponentProps> = (props) => {

    const {organizationId, onLeave, minimized} = props

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
            <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Avatar size={32}
                            color={hashToColor(organization?.name ?? "", 200, 360)}
                            identifier={organization?.name ?? ""}/>
                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                        <Text size={"md"} hierarchy={"primary"}>
                            {organization?.name}
                        </Text>
                    </Flex>
                </Flex>
                {!minimized && (
                    <Text hierarchy={"tertiary"}>
                        Updated {formatDistanceToNow(organization?.updatedAt!)} ago
                    </Text>
                )}

            </Flex>
        </DataTableColumn>
        {!minimized && (
            <>
                <DataTableColumn>
                    <Flex align={"center"} justify={"end"} style={{gap: "0.7rem"}}>
                        {namespace?.projects?.count ? (
                            <Text hierarchy={"tertiary"}>
                                {namespace?.projects?.count ?? 0} {" "}
                                projects
                            </Text>
                        ) : null}

                        {namespace?.members?.count ? (
                            <Text hierarchy={"tertiary"}>
                                {namespace?.members?.count ?? 0}{" "}
                                members
                            </Text>
                        ) : null}

                        {namespace?.runtimes?.count ? (
                            <Text hierarchy={"tertiary"}>
                                {namespace?.runtimes?.count ?? 0}{" "}
                                connected runtimes
                            </Text>
                        ) : null}
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
        )}

    </>
}