import React from "react";
import {DataTable, DataTableColumn, Text} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {User} from "@code0-tech/sagittarius-graphql-types";
import {UserDataTableRowComponent} from "@edition/user/components/UserDataTableRowComponent";
import {useUsers} from "@edition/user/hooks/User.hook";

export interface UserDataTableComponentProps {
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: User, index: number) => boolean
    onSelect?: (item: User | undefined) => void
}

export const UserDataTableComponent: React.FC<UserDataTableComponentProps> = (props) => {

    const {sort, filter, preFilter = () => true, onSelect} = props

    const users = useUsers()

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No user found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={users}>
        {(runtime, index) => {
            return <UserDataTableRowComponent userId={runtime.id}/>
        }}
    </DataTable>

}