"use client"

import {Alert, Button, DataTableColumn, Flex, Spacing, Text, toast, useService, useStore} from "@code0-tech/pictor";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import React from "react";
import {useParams} from "next/navigation";
import {RoleService} from "@edition/role/services/Role.service";
import type {Namespace, NamespaceProject, NamespaceRole, Scalars} from "@code0-tech/sagittarius-graphql-types";
import {ProjectDataTableComponent} from "@edition/project/components/ProjectDataTableComponent";
import {ProjectMenuComponent} from "@edition/project/components/ProjectMenuComponent";
import {ProjectView} from "@edition/project/services/Project.view";
import {IconTrash} from "@tabler/icons-react";

export const RoleProjectView: React.FC = () => {

    const params = useParams()
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)
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

    const assignProjects = () => {
        startTransition(() => {
            roleService.roleAssignProject({
                roleId: roleId,
                projectIds: assignedProjectIds as Scalars['NamespaceProjectID']['output'][]
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({
                        title: "All projects were successfully assigned to the role.",
                        color: "success",
                        dismissible: true,
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

    const filterNotAssignedProjects = React.useCallback((project: ProjectView) => {
        return !assignedProjectIds.find(projectId => projectId == project.id!!)
    }, [assignedProjectIds])

    const filterAssignedProjects = React.useCallback((project: NamespaceProject) => {
        return !!assignedProjectIds.find(projectId => projectId == project.id!!)
    }, [assignedProjectIds])

    return <TabContent pl={"0.7"} value={"project"} style={{overflow: "hidden"}}>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Projects that members can access
            </Text>
            <Flex align={"center"} style={{gap: ".7rem"}}>
                <Button color={"success"} onClick={assignProjects}>Save changes</Button>
                <ProjectMenuComponent namespaceId={namespaceId}
                                      key={String(assignedProjectIds)}
                                      filter={filterNotAssignedProjects}
                                      onProjectSelect={(project) => addAssignedProject(project.id!!)}>
                    <Button>Add project</Button>
                </ProjectMenuComponent>
            </Flex>
        </Flex>

        <Spacing spacing={"xl"}/>
        {(assignedProjectIds.length ?? 0) <= 0 ? (
            <Alert color={"info"}>
                <Text style={{textAlign: "center"}} size={"md"} hierarchy={"secondary"}>
                    This role has no project assignments. Members with this role will have access to all
                    projects in the organization namespace.
                </Text>
            </Alert>
        ) : (
            <>
                <ProjectDataTableComponent additionalColumns={(project, index) => {
                    return [
                        <DataTableColumn>
                            <Button color={"error"} variant={"none"}
                                    onClick={() => removeAssignedProject(project?.id!)}>
                                <IconTrash size={16}/>
                            </Button>
                        </DataTableColumn>
                    ]
                }} namespaceId={namespaceId} preFilter={filterAssignedProjects}/>
            </>
        )}
    </TabContent>
}