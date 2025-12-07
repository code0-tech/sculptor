"use client"

import React from "react";
import type {Namespace, NamespaceRole, NamespaceRoleAbility, Scalars} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";
import {
    Alert,
    AuroraBackground,
    Button,
    Card,
    CheckboxInput,
    Col,
    DLayout,
    DNamespaceProjectView,
    Flex,
    Row,
    Spacing,
    Text,
    toast,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {RoleService} from "@edition/role/Role.service";
import {ProjectService} from "@edition/project/Project.service";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {DNamespaceRolePermissions} from "@code0-tech/pictor/dist/components/d-role/DNamespaceRolePermissions";
import DNamespaceProjectMenu from "@code0-tech/pictor/dist/components/d-project/DNamespaceProjectMenu";
import {DNamespaceProjectContent} from "@code0-tech/pictor/dist/components/d-project/DNamespaceProjectContent";
import {IconTrash} from "@tabler/icons-react";

type Permission = {
    label: string
    ability: NamespaceRoleAbility | string
}

type PermissionGroup = {
    title: string
    permissions: Permission[]
}

type PermissionObject = {
    [key: NamespaceRoleAbility | string]: boolean
}

type PermissionTemplate = {
    name: string
    abilities: PermissionObject
}


const permissions: PermissionGroup[] = [
    {
        title: "Member permissions",
        permissions: [
            {label: "Assign member roles", ability: "ASSIGN_MEMBER_ROLES"},
            {label: "Add member", ability: "INVITE_MEMBER"},
            {label: "Remove member", ability: "DELETE_MEMBER"},
        ]
    },
    {
        title: "Project permissions",
        permissions: [
            {label: "Create project", ability: "CREATE_NAMESPACE_PROJECT"},
            {label: "Update project", ability: "UPDATE_NAMESPACE_PROJECT"},
            {label: "Delete project", ability: "DELETE_NAMESPACE_PROJECT"},
            {label: "Read project", ability: "READ_NAMESPACE_PROJECT"},
        ]
    },
    {
        title: "Role permissions",
        permissions: [
            {label: "Create role", ability: "CREATE_NAMESPACE_ROLE"},
            {label: "Update role", ability: "UPDATE_NAMESPACE_ROLE"},
            {label: "Limit roles to projects", ability: "ASSIGN_ROLE_PROJECTS"},
            {label: "Assign role abilities", ability: "ASSIGN_ROLE_ABILITIES"},
        ]
    },
    {
        title: "Runtime permissions",
        permissions: [
            {label: "Create runtime", ability: "CREATE_RUNTIME"},
            {label: "Update runtime", ability: "UPDATE_RUNTIME"},
            {label: "Delete runtime", ability: "DELETE_RUNTIME"},
            {label: "Rotate runtime token", ability: "ROTATE_RUNTIME_TOKEN"},
            {label: "Assign runtime to projects", ability: "ASSIGN_PROJECT_RUNTIMES"},
        ]
    },
    {
        title: "Flow permissions",
        permissions: [
            {label: "Create flow", ability: "CREATE_FLOW"},
            {label: "Update flow", ability: "UPDATE_FLOW"},
            {label: "Delete flow", ability: "DELETE_FLOW"},
        ]
    },
    {
        title: "License permissions",
        permissions: [
            {label: "Create license", ability: "CREATE_NAMESPACE_LICENSE"},
            {label: "Read license", ability: "READ_NAMESPACE_LICENSE"},
            {label: "Delete license", ability: "DELETE_NAMESPACE_LICENSE"},
        ]
    },
    {
        title: "Organization permissions",
        permissions: [
            {label: "Update organization", ability: "UPDATE_ORGANIZATION"},
            {label: "Delete organization", ability: "DELETE_ORGANIZATION"},
        ]
    },
    {
        title: "Administrator permissions",
        permissions: [
            {label: "Namespace administrator", ability: "NAMESPACE_ADMINISTRATOR"},
        ]
    }
]

const defaultPermissions = {
    ...permissions.reduce((acc, group) => {
        group.permissions.forEach(permission => {
            acc[permission.ability] = false
        })
        return acc
    }, {} as Record<string, boolean>)
}

const permissionTemplates: PermissionTemplate[] = [
    {
        name: "Flow developer role template",
        abilities: {
            ...defaultPermissions,
            "CREATE_FLOW": true,
            "UPDATE_FLOW": true,
            "DELETE_FLOW": true,
            "CREATE_NAMESPACE_PROJECT": true,
            "UPDATE_NAMESPACE_PROJECT": true,
            "ASSIGN_PROJECT_RUNTIMES": true
        }
    },
    {
        name: "Team manager role template",
        abilities: {
            ...defaultPermissions,
            "INVITE_MEMBER": true,
            "DELETE_MEMBER": true,
            "ASSIGN_MEMBER_ROLES": true,
            "CREATE_NAMESPACE_ROLE": true,
            "UPDATE_NAMESPACE_ROLE": true,
            "ASSIGN_ROLE_PROJECTS": true,
            "ASSIGN_ROLE_ABILITIES": true

        }
    },
    {
        name: "Runtime manager role template",
        abilities: {
            ...defaultPermissions,
            "CREATE_RUNTIME": true,
            "UPDATE_RUNTIME": true,
            "DELETE_RUNTIME": true,
            "ROTATE_RUNTIME_TOKEN": true,
            "ASSIGN_PROJECT_RUNTIMES": true
        }
    },
    {
        name: "Project manager role template",
        abilities: {
            ...defaultPermissions,
            "CREATE_NAMESPACE_PROJECT": true,
            "UPDATE_NAMESPACE_PROJECT": true,
            "DELETE_NAMESPACE_PROJECT": true,
            "READ_NAMESPACE_PROJECT": true,
            "ASSIGN_PROJECT_RUNTIMES": true
        }
    }
]

export const RoleSettingsPage: React.FC = () => {

    //TODO: limit tabs based on user abilities for roles
    //TODO: add general adjustments tab for role name update
    //TODO: delete role functionality as tab

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
    const roleAbilities = React.useMemo(() => {
        return {
            ...permissions.reduce((acc, group) => {
                group.permissions.forEach(permission => {
                    acc[permission.ability] = role?.abilities?.includes(permission.ability as NamespaceRoleAbility) ?? false
                })
                return acc
            }, {} as Record<string, boolean>)
        }
    }, [role])

    const roleAssignedProjects = React.useMemo(() => role?.assignedProjects?.nodes?.map(p => p?.id!!) ?? [], [role])
    const [assignedProjectIds, setAssignedProjectIds] = React.useState<Scalars['NamespaceProjectID']['output'][]>(roleAssignedProjects)
    const [initialValues, setInitialValues] = React.useState(roleAbilities)

    React.useEffect(() => {
        setAssignedProjectIds(roleAssignedProjects)
    }, [role])

    React.useEffect(() => {
        setInitialValues(roleAbilities)
    }, [role])

    const [inputs, validate] = useForm({
        initialValues: initialValues,
        validate: {},
        onSubmit: (values) => {
            startTransition(() => {
                const updatedAbilities = Object.entries(values)
                    .filter(([_, enabled]) => enabled)
                    .map(([ability, _]) => ability as NamespaceRoleAbility)
                roleService.roleAssignAbilities({
                    roleId: roleId!!,
                    abilities: updatedAbilities
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({
                            title: "The permissions were successfully updated.",
                            color: "success",
                            dismissible: true,
                        })
                    }
                })
            })
        }
    })

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

    return <>
        <Spacing spacing={"xl"}/>
        <Flex style={{gap: "0.7rem"}} align={"center"}>
            <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                {role?.name}
            </Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Tab orientation={"vertical"} defaultValue={"permission"}>
            <DLayout leftContent={
                <TabList>
                    <TabTrigger value={"permission"} asChild>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>Permission adjustments</Text>
                        </Button>
                    </TabTrigger>
                    <TabTrigger value={"project"} asChild>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>Limit to projects</Text>
                        </Button>
                    </TabTrigger>
                </TabList>
            }>
                <>
                    <TabContent value={"permission"} style={{overflow: "hidden"}}>
                        <Text size={"xl"} hierarchy={"primary"} style={{fontWeight: 600}}>
                            Select from role templates
                        </Text>
                        <Spacing spacing={"xl"}/>
                        {React.useMemo(() => {
                            return <Row>
                                {permissionTemplates.map(permissionTemplate => {

                                    const templateAbilities = Object.entries(permissionTemplate.abilities)
                                        .filter(([_, enabled]) => enabled)
                                        .map(([ability]) => ability as NamespaceRoleAbility);

                                    const roleAbilities = Object.entries(initialValues)
                                        .filter(([_, enabled]) => enabled)
                                        .map(([ability]) => ability as NamespaceRoleAbility);

                                    const isSelected = templateAbilities.length === roleAbilities.length
                                        && templateAbilities.every(a => new Set(roleAbilities).has(a));


                                    return <Col>
                                        <Card>
                                            <Text style={{fontWeight: 500}} size={"lg"} hierarchy={"secondary"}>
                                                {permissionTemplate.name}
                                            </Text>
                                            <Spacing spacing={"xs"}/>
                                            <DNamespaceRolePermissions
                                                abilities={Object.entries(permissionTemplate.abilities)
                                                    .filter(([_, enabled]) => enabled)
                                                    .map(([ability, _]) => ability as NamespaceRoleAbility)}/>
                                            <Spacing spacing={"xl"}/>
                                            <Button disabled={isSelected} color={"secondary"} variant={"filled"}
                                                    w={"100%"}
                                                    onClick={() => setInitialValues(permissionTemplate.abilities)}>Select
                                                template</Button>
                                            {isSelected ? <AuroraBackground/> : null}
                                        </Card>
                                    </Col>
                                })}
                            </Row>
                        }, [initialValues, role])}
                        <Spacing spacing={"xl"}/>
                        <Flex align={"center"} justify={"space-between"}>
                            <div>
                                <Text size={"xl"} hierarchy={"primary"} style={{fontWeight: 600}}>Current stored
                                    permissions</Text>
                                <Spacing spacing={"xs"}/>
                                <DNamespaceRolePermissions abilities={role?.abilities!!}/>
                            </div>
                            <Button color={"success"} onClick={validate}>
                                Update role permissions
                            </Button>
                        </Flex>
                        <Spacing spacing={"xl"}/>
                        <Card p={1.3}>
                            {permissions.map(permissionGroup => {
                                return <CardSection border>
                                    <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                        <Text size={"md"} hierarchy={"primary"}>{permissionGroup.title}</Text>
                                        <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                            {permissionGroup.permissions.map(permission => (
                                                <>
                                                    <CheckboxInput label={permission.label}
                                                                   key={String(permission.ability + inputs.getInputProps(permission.ability).initialValue)}
                                                                   {...inputs.getInputProps(permission.ability)}/>
                                                </>
                                            ))}
                                        </Flex>

                                    </Flex>
                                </CardSection>
                            })}
                        </Card>
                    </TabContent>
                    <TabContent value={"project"} style={{overflow: "hidden"}}>
                        <Flex align={"center"} justify={"space-between"}>
                            <Text size={"xl"} hierarchy={"primary"} style={{fontWeight: 600}}>Projects that members can
                                access</Text>
                            <Flex align={"center"} style={{gap: ".7rem"}}>
                                <Button color={"success"} onClick={assignProjects}>Update assigned projects</Button>
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
                </>
            </DLayout>
        </Tab>
    </>
}