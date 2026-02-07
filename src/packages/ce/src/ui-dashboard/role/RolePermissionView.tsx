"use client"

import {
    AuroraBackground,
    Button,
    Card,
    CheckboxInput,
    Col,
    Flex,
    Row,
    Spacing,
    Text,
    toast,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import React from "react";
import type {Namespace, NamespaceRole, NamespaceRoleAbility} from "@code0-tech/sagittarius-graphql-types";
import {DNamespaceRolePermissions} from "@code0-tech/pictor/dist/components/d-role/DNamespaceRolePermissions";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {useParams} from "next/navigation";
import {RoleService} from "@edition/role/Role.service";

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

export const RolePermissionView: React.FC = () => {

    const params = useParams()
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)
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

    const [initialValues, setInitialValues] = React.useState(roleAbilities)

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

    return <TabContent pl={"0.7"} value={"permission"} style={{overflow: "hidden"}}>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Select from role templates
            </Text>
            <Button color={"success"} onClick={validate}>
                Save changes
            </Button>
        </Flex>
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
        <Text size={"xl"} hierarchy={"primary"}>
            Current stored permissions
        </Text>
        <Spacing spacing={"xxs"}/>
        <DNamespaceRolePermissions abilities={role?.abilities!!}/>
        <Spacing spacing={"xl"}/>
        <Card color={"secondary"}>
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
}