import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace, NamespaceProject, NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";
import {ProjectDataTableRowComponent} from "@edition/project/components/ProjectDataTableRowComponent";
import {RoleService} from "@edition/role/services/Role.service";
import {RoleDataTableRowComponent} from "@edition/role/components/RoleDataTableRowComponent";

export interface ProjectDataTableComponentProps {
    namespaceId: Namespace["id"]
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: NamespaceRole, index: number) => boolean
    onSelect?: (item: NamespaceRole | undefined) => void
}

export const RoleDataTableComponent: React.FC<ProjectDataTableComponentProps> = (props) => {

    const {namespaceId, sort, filter, preFilter = () => true, onSelect} = props

    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)

    const roles = React.useMemo(
        () => roleService.values({namespaceId: namespaceId}),
        [roleStore, namespaceId]
    )

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No role found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={roles.map(r => r.json()).filter(preFilter)}>
        {(role, index) => {
            return <RoleDataTableRowComponent roleId={role.id}/>
        }}
    </DataTable>

}