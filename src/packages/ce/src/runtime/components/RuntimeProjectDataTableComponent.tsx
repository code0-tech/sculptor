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
import {RuntimeProjectDataTableRowComponent} from "@edition/runtime/components/RuntimeProjectDataTableRowComponent";

export interface RuntimeProjectDataTableComponentProps {
    projectId?: NamespaceProject["id"]
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: Runtime, index: number) => boolean
    onSelect?: (item: Runtime | undefined) => void
    minimized?: boolean
}

export const RuntimeProjectDataTableComponent: React.FC<RuntimeProjectDataTableComponentProps> = (props) => {

    const {projectId, sort, filter, preFilter = () => true, onSelect, minimized} = props

    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const project = React.useMemo(
        () => projectService.getById(projectId),
        [projectStore, projectId]
    )

    const runtimes = React.useMemo(
        () => runtimeService.values().filter(runtime => project?.runtimes?.nodes?.some(r => r?.id === runtime.id)),
        [runtimeStore, project]
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
            return <RuntimeProjectDataTableRowComponent projectId={projectId} runtimeId={runtime.id}/>
        }}
    </DataTable>

}