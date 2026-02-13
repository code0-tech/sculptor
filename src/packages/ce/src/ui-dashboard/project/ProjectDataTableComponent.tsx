import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/Project.service";
import {ProjectDataTableRowComponent} from "@edition/ui-dashboard/project/ProjectDataTableRowComponent";

export interface ProjectDataTableComponentProps {
    namespaceId: Namespace["id"]
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: NamespaceProject, index: number) => boolean
    onSelect?: (item: NamespaceProject | undefined) => void
}

export const ProjectDataTableComponent: React.FC<ProjectDataTableComponentProps> = (props) => {

    const {namespaceId, sort, filter, preFilter = () => true, onSelect} = props

    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const projects = React.useMemo(() => projectService.values({namespaceId: namespaceId}), [projectStore, namespaceId])

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No role found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={projects.map(p => p.json()).filter(preFilter)}>
        {(project, index) => {
            return <ProjectDataTableRowComponent projectId={project.id}/>
        }}
    </DataTable>

}