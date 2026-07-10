import React from "react";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {Avatar, Button, DataTableColumn, Flex, hashToColor, Text, useService, useStore} from "@code0-tech/pictor";
import {IconLogout} from "@tabler/icons-react";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {MemberService} from "@edition/member/services/Member.service";
import {UserService} from "@edition/user/services/User.service";
import {formatDistanceToNow} from "date-fns";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

export interface NamespaceDataTableRowComponentProps {
    namespaceId: Namespace['id']
    onLeave?: (namespace: Namespace) => void
    minimized?: boolean
}

export const NamespaceDataTableRowComponent: React.FC<NamespaceDataTableRowComponentProps> = (props) => {

    const {namespaceId, onLeave, minimized} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const namespace = React.useMemo(
        () => namespaceService.getById(namespaceId),
        [namespaceStore, namespaceId]
    )

    const name = React.useMemo(
        () => getNamespaceName(namespace, organizationService, userService),
        [namespace, organizationStore, userStore]
    )

    const namespaceMember = React.useMemo(
        () => namespace && currentUser ? memberService.getByNamespaceIdAndUserId(namespace.id, currentUser.id) : null,
        [memberStore, namespace, currentUser]
    )

    return <>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
                <Flex align={"center"} style={{gap: "0.7rem"}}>
                    <Avatar size={32}
                            color={hashToColor(name ?? "", 200, 360)}
                            identifier={name ?? ""}/>
                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                        <Text size={"md"} hierarchy={"primary"}>
                            {name}
                        </Text>
                    </Flex>
                </Flex>
                {!minimized && (
                    <Text hierarchy={"tertiary"}>
                        Updated {formatDistanceToNow(namespace?.updatedAt!)} ago
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
                            if (namespace) onLeave(namespace)
                        }}>
                            <IconLogout size={13}/> Leave
                        </Button>
                    </DataTableColumn>
                ) : null}
            </>
        )}

    </>
}
