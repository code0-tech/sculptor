import React from "react";
import {Avatar, DataTable, DataTableColumn, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/Project.service";
import {FlowService} from "@edition/flow/Flow.service";
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
                      onSelect={onSelect}
                      data={projects.map(p => p.json()).filter(preFilter)}>
        {(project, index) => {
            return <ProjectDataTableRowComponent projectId={project.id}/>
        }}
    </DataTable>

}