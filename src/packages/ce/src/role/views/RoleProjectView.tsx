"use client"

import {
    Alert,
    Badge,
    Button,
    ButtonGroup,
    DataTableColumn,
    Flex,
    Menu,
    MenuCheckboxItem,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import React from "react";
import {useParams} from "next/navigation";
import {RoleService} from "@edition/role/services/Role.service";
import {ProjectService} from "@edition/project/services/Project.service";
import type {Namespace, NamespaceProject, NamespaceRole, Scalars} from "@code0-tech/sagittarius-graphql-types";
import {ProjectDataTableComponent} from "@edition/project/components/ProjectDataTableComponent";
import {ProjectMenuComponent} from "@edition/project/components/ProjectMenuComponent";
import {IconAdjustmentsHorizontal, IconArrowsSort, IconCheck, IconPlus, IconTrash} from "@tabler/icons-react";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

const sortLabels = {
    name: "Name",
    createdAt: "Created",
    updatedAt: "Updated",
} as const

const toggle = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])

export const RoleProjectView: React.FC = () => {

    const params = useParams()
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const [, startTransition] = React.useTransition()

    const namespaceIndex = params.namespaceId as any as number
    const roleIndex = params.roleId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const roleId: NamespaceRole['id'] = `gid://sagittarius/NamespaceRole/${roleIndex}`

    const role = React.useMemo(() => roleService.getById(roleId, {namespaceId: namespaceId}), [roleStore, roleId, namespaceId])
    const roleAssignedProjects = React.useMemo(() => role?.assignedProjects?.nodes?.map(p => p?.id!!) ?? [], [role])
    const [assignedProjectIds, setAssignedProjectIds] = React.useState<Scalars['NamespaceProjectID']['output'][]>(roleAssignedProjects)

    React.useEffect(() => {
        setAssignedProjectIds(roleAssignedProjects)
    }, [role])

    const projects = React.useMemo(() => projectService.values({namespaceId: namespaceId}), [projectStore, namespaceId])
    const assignedProjects = React.useMemo(
        () => projects.filter(p => assignedProjectIds.find(id => id == p?.id)),
        [projects, assignedProjectIds]
    )

    const [sort, setSort] = React.useState<keyof typeof sortLabels>("name")
    const [nameFilter, setNameFilter] = React.useState<string[]>([])

    const sortProps: DataTableSortProps = {[sort]: "asc"}
    const hasFilter = nameFilter.length > 0

    const assignProjects = () => {
        startTransition(() => {
            roleService.roleAssignProject({
                roleId: roleId,
                projectIds: assignedProjectIds as Scalars['NamespaceProjectID']['output'][]
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    addIslandSuccessNotification({
                        message: "Assigned project"
                    })
                }
            })
        })
    }

    const addAssignedProject = (projectId: Scalars['NamespaceProjectID']['output']) => {
        setAssignedProjectIds(prevState => {
            return [...prevState, projectId]
        })
    }

    const removeAssignedProject = (projectId: Scalars['NamespaceProjectID']['output']) => {
        setAssignedProjectIds(prevState => {
            return prevState.filter(id => id !== projectId)
        })
    }

    const filterNotAssignedProjects = React.useCallback((project: NamespaceProject) => {
        return !assignedProjectIds.find(projectId => projectId == project.id!!)
    }, [assignedProjectIds])

    const filterAssignedProjects = React.useCallback((project: NamespaceProject) => {
        if (!assignedProjectIds.find(projectId => projectId == project.id!!)) return false
        if (nameFilter.length > 0 && !nameFilter.includes(project?.name!)) return false
        return true
    }, [assignedProjectIds, nameFilter])

    const visibleCount = React.useMemo(
        () => assignedProjects.filter(p => nameFilter.length === 0 || nameFilter.includes(p?.name!)).length,
        [assignedProjects, nameFilter]
    )

    return <TabContent pl={"0.7"} value={"project"} style={{overflow: "hidden"}}>
        <Flex align={"center"} justify={"space-between"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Assigned projects</Text>
                <Badge color={"secondary"}>{visibleCount}</Badge>
            </Flex>
            <ButtonGroup>
                {/* Filter */}
                <Menu>
                    <MenuTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"} active={hasFilter}>
                            <IconAdjustmentsHorizontal size={13}/>
                        </Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent sideOffset={8} align={"end"}>
                            <MenuLabel>Name</MenuLabel>
                            {assignedProjects.map(project => (
                                <MenuCheckboxItem key={project.id} checked={nameFilter.includes(project?.name!)}
                                                  onSelect={e => {
                                                      e.preventDefault()
                                                      e.stopPropagation()
                                                      toggle(project?.name!, setNameFilter)
                                                  }}>
                                    <IconCheck size={13}
                                               color={nameFilter.includes(project?.name!) ? undefined : "transparent"}/>
                                    {project?.name}
                                </MenuCheckboxItem>
                            ))}
                        </MenuContent>
                    </MenuPortal>
                </Menu>

                {/* Sort */}
                <Menu>
                    <MenuTrigger asChild>
                        <Button variant={"none"} paddingSize={"xxs"}>
                            <IconArrowsSort size={13}/>
                        </Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent sideOffset={8} align={"end"}>
                            <MenuLabel>Sort by</MenuLabel>
                            {(Object.keys(sortLabels) as (keyof typeof sortLabels)[]).map(k => (
                                <MenuItem key={k} onSelect={() => setSort(k)}>
                                    <IconCheck size={13} color={sort === k ? undefined : "transparent"}/>
                                    {sortLabels[k]}
                                </MenuItem>
                            ))}
                        </MenuContent>
                    </MenuPortal>
                </Menu>

                {/* Add */}
                <ProjectMenuComponent namespaceId={namespaceId}
                                      key={String(assignedProjectIds)}
                                      filter={filterNotAssignedProjects}
                                      onProjectSelect={(project) => addAssignedProject(project.id!!)}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </ProjectMenuComponent>

                {/* Save */}
                <Button paddingSize={"xxs"} color={"success"} variant={"none"}
                        onClick={assignProjects}>Save changes</Button>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Limit the projects that members with this role can access.
        </Text>
        <Spacing spacing={"md"}/>
        {(assignedProjectIds.length ?? 0) <= 0 ? (
            <Alert color={"info"}>
                <Text style={{textAlign: "center"}} size={"md"} hierarchy={"secondary"}>
                    This role has no project assignments. Members with this role will have access to all
                    projects in the organization namespace.
                </Text>
            </Alert>
        ) : (
            <ProjectDataTableComponent sort={sortProps}
                                       additionalColumns={(project, index) => {
                                           return [
                                               <DataTableColumn>
                                                   <Button color={"error"} variant={"none"}
                                                           onClick={() => removeAssignedProject(project?.id!)}>
                                                       <IconTrash size={16}/>
                                                   </Button>
                                               </DataTableColumn>
                                           ]
                                       }} namespaceId={namespaceId} preFilter={filterAssignedProjects}/>
        )}
    </TabContent>
}
