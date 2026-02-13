import React from "react";
import {NamespaceProject, NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {Avatar, DataTableColumn, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {ProjectService} from "@edition/project/Project.service";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {hashToColor} from "@code0-tech/pictor/dist/components/d-flow/DFlow.util";
import {formatDistanceToNow} from "date-fns";
import {RoleService} from "@edition/role/Role.service";
import {DNamespaceRolePermissions} from "@code0-tech/pictor/dist/components/d-role/DNamespaceRolePermissions";

export interface ProjectDataTableRowComponentProps {
    roleId: NamespaceRole['id']
}

export const RoleDataTableRowComponent: React.FC<ProjectDataTableRowComponentProps> = (props) => {

    const {roleId} = props

    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)

    const role = React.useMemo(
        () => roleService.getById(roleId),
        [roleStore, roleId]
    )

    return <>
        <DataTableColumn>
            <Flex style={{flexDirection: "column", gap: "1.3rem"}}>
                <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        {role?.name}
                    </Text>
                    <DNamespaceRolePermissions abilities={role?.abilities!}/>
                </Flex>
                <Text hierarchy={"tertiary"}>
                    Updated {formatDistanceToNow(role?.updatedAt!)} ago
                </Text>
            </Flex>
        </DataTableColumn>
        <DataTableColumn>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Text hierarchy={"tertiary"}>
                    {role?.assignedProjects?.count ?? 0}{" "}
                    assigned projects
                </Text>
            </Flex>
        </DataTableColumn>
    </>
}