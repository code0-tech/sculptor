import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace, NamespaceProject, NamespaceRole, Runtime} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/Project.service";
import {ProjectDataTableRowComponent} from "@edition/ui-dashboard/project/ProjectDataTableRowComponent";
import {RoleService} from "@edition/role/Role.service";
import {RoleDataTableRowComponent} from "@edition/ui-dashboard/role/RoleDataTableRowComponent";
import {RuntimeService} from "@edition/runtime/Runtime.service";
import {RuntimeDataTableRowComponent} from "@edition/ui-dashboard/runtime/RuntimeDataTableRowComponent";

export interface ProjectDataTableComponentProps {
    namespaceId?: Namespace["id"]
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: Runtime, index: number) => boolean
    onSelect?: (item: Runtime | undefined) => void
}

export const RuntimeDataTableComponent: React.FC<ProjectDataTableComponentProps> = (props) => {

    const {namespaceId, sort, filter, preFilter = () => true, onSelect} = props

    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const runtimes = React.useMemo(
        () => runtimeService.values({namespaceId: namespaceId}),
        [runtimeStore, namespaceId]
    )

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No runtime found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={runtimes.map(r => r.json()).filter(preFilter)}>
        {(runtime, index) => {
            return <RuntimeDataTableRowComponent runtimeId={runtime.id}/>
        }}
    </DataTable>

}