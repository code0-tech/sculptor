import React from "react";
import {
    DataTableFilterInput,
    DataTableFilterSuggestionMenu,
    MenuCheckboxItem,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconCheck} from "@tabler/icons-react";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {DataTableFilterProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {ProjectService} from "@edition/project/Project.service";

export interface ProjectDataTableFilterInputComponentProps {
    namespaceId: Namespace['id']
    onChange: (filter: DataTableFilterProps) => void
}

export const ProjectDataTableFilterInputComponent: React.FC<ProjectDataTableFilterInputComponentProps> = (props) => {

    const {namespaceId, onChange} = props

    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const projects = React.useMemo(
        () => projectService.values({namespaceId: namespaceId}),
        [projectStore, namespaceId]
    )

    return <DataTableFilterInput onChange={onChange} filterTokens={[
        {
            token: "name",
            key: "name",
            operators: ["isOneOf"],
            suggestion: (context, operator, currentValue, applySuggestion) => {

                const split = currentValue.split(",").map(s => s.trim()).filter(Boolean)

                return <DataTableFilterSuggestionMenu context={context}>
                    {projects.map(project => {

                        const isChecked = split.includes(project?.name!)

                        return <MenuCheckboxItem key={project.id} checked={isChecked} onSelect={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const updated = isChecked
                                ? split.filter(name => name !== project?.name)
                                : [...split, project?.name];
                            applySuggestion(updated.join(","), true);
                        }}>
                            {isChecked ? <IconCheck size={13}/> : <IconCheck color={"transparent"} size={13}/>}
                            {project?.name}
                        </MenuCheckboxItem>
                    })}
                </DataTableFilterSuggestionMenu>
            }
        }
    ]}/>
}