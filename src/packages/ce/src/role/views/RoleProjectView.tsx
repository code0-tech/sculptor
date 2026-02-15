"use client"

import {
    Alert,
    Button,
    Card,
    DNamespaceProjectView,
    Flex,
    Spacing,
    Text,
    toast,
    useService,
    useStore
} from "@code0-tech/pictor";
import DNamespaceProjectMenu from "@code0-tech/pictor/dist/components/d-project/DNamespaceProjectMenu";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {DNamespaceProjectContent} from "@code0-tech/pictor/dist/components/d-project/DNamespaceProjectContent";
import {IconTrash} from "@tabler/icons-react";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import React from "react";
import {useParams} from "next/navigation";
import {RoleService} from "@edition/role/services/Role.service";
import type {Namespace, NamespaceRole, Scalars} from "@code0-tech/sagittarius-graphql-types";

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

    const filterProjects = React.useCallback((project: DNamespaceProjectView) => {
        return !assignedProjectIds.find(projectId => projectId == project.id!!)
    }, [assignedProjectIds])

    return <TabContent pl={"0.7"} value={"project"} style={{overflow: "hidden"}}>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Projects that members can access
            </Text>
            <Flex align={"center"} style={{gap: ".7rem"}}>
                <Button color={"success"} onClick={assignProjects}>Save changes</Button>
                <DNamespaceProjectMenu namespaceId={namespaceId}
                                       key={String(assignedProjectIds)}
                                       filter={filterProjects}
                                       onProjectSelect={(project) => addAssignedProject(project.id!!)}>
                    <Button>Add project</Button>
                </DNamespaceProjectMenu>
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
            <Card>
                {assignedProjectIds.map(projectId => {
                    return <CardSection key={projectId} border>
                        <Flex align={"center"} style={{gap: "1.3rem"}} justify={"space-between"}>
                            <DNamespaceProjectContent minimized projectId={projectId}/>
                            <Button color={"error"} variant={"filled"} onClick={() => removeAssignedProject(projectId)}>
                                <IconTrash size={16}/>
                            </Button>
                        </Flex>
                    </CardSection>
                })}
            </Card>
        )}
    </TabContent>
}