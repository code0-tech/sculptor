import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace, NamespaceProject, NamespaceRole, Runtime} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";
import {ProjectDataTableRowComponent} from "@edition/project/components/ProjectDataTableRowComponent";
import {RoleService} from "@edition/role/services/Role.service";
import {RoleDataTableRowComponent} from "@edition/role/components/RoleDataTableRowComponent";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {RuntimeDataTableRowComponent} from "@edition/runtime/components/RuntimeDataTableRowComponent";

export interface ProjectDataTableComponentProps {
    namespaceId?: Namespace["id"]
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: Runtime, index: number) => boolean
    onSelect?: (item: Runtime | undefined) => void
    minimized?: boolean
}

export const RuntimeDataTableComponent: React.FC<ProjectDataTableComponentProps> = (props) => {

    const {namespaceId, sort, filter, preFilter = () => true, onSelect, minimized} = props

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
            return <RuntimeDataTableRowComponent minimized={minimized} runtimeId={runtime.id}/>
        }}
    </DataTable>

}