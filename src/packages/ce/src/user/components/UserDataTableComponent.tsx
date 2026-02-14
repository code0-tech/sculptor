import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace, NamespaceProject, NamespaceRole, Runtime, User} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";
import {ProjectDataTableRowComponent} from "@edition/project/components/ProjectDataTableRowComponent";
import {RoleService} from "@edition/role/services/Role.service";
import {RoleDataTableRowComponent} from "@edition/role/components/RoleDataTableRowComponent";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {RuntimeDataTableRowComponent} from "@edition/runtime/components/RuntimeDataTableRowComponent";
import {UserDataTableRowComponent} from "@edition/user/components/UserDataTableRowComponent";
import {UserService} from "@edition/user/services/User.service";

export interface UserDataTableComponentProps {
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: User, index: number) => boolean
    onSelect?: (item: User | undefined) => void
}

export const UserDataTableComponent: React.FC<UserDataTableComponentProps> = (props) => {

    const {sort, filter, preFilter = () => true, onSelect} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const users = React.useMemo(
        () => userService.values(),
        [userStore]
    )

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No user found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={users.map(u => u.json()).filter(preFilter)}>
        {(runtime, index) => {
            return <UserDataTableRowComponent userId={runtime.id}/>
        }}
    </DataTable>

}