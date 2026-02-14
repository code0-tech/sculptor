import React from "react";
import {NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {DataTableColumn, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {formatDistanceToNow} from "date-fns";
import {RoleService} from "@edition/role/services/Role.service";
import {RolePermissionComponent} from "@edition/role/components/RolePermissionComponent";

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
                    <RolePermissionComponent abilities={role?.abilities!}/>
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