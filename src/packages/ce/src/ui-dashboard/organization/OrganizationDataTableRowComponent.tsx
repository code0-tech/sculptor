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
import {IconFolders, IconLogout, IconServer, IconUsers} from "@tabler/icons-react";
import {OrganizationService} from "@edition/organization/Organization.service";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {MemberService} from "@edition/member/Member.service";
import {UserService} from "@edition/user/User.service";
import {hashToColor} from "@code0-tech/pictor/dist/components/d-flow/DFlow.util";

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
    const memberStore = useStore(MemberService)
    const memberService = useService(MemberService)
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

    return <>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Avatar bg={"transparent"}
                            color={hashToColor("organization")}
                            identifier={organization?.name ?? ""}/>
                    <Text size={"md"}>
                        {organization?.name}
                    </Text>
                </Flex>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Badge bg={"transparent"}>
                        <IconFolders size={13}/>
                        <Text>
                            {namespace?.projects?.count ?? 0}
                        </Text>
                    </Badge>
                    <Badge bg={"transparent"}>
                        <IconUsers size={13}/>
                        <Text>
                            {namespace?.members?.count ?? 0}
                        </Text>
                    </Badge>
                    <Badge bg={"transparent"}>
                        <IconServer size={13}/>
                        <Text>
                            {namespace?.runtimes?.count ?? 0}
                        </Text>
                    </Badge>
                    <Text color={"tertiary"}>
                        Updated at {organization?.updatedAt}
                    </Text>
                </Flex>
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            {onLeave && namespaceMember && namespaceMember.userAbilities?.deleteMember ? (
                <Button variant={"filled"} color={"error"} onClick={(event) => {
                    event.stopPropagation()
                    if (organization) onLeave(organization)
                }}>
                    <IconLogout size={13}/> Leave
                </Button>
            ) : null}
        </DataTableColumn>
    </>
}