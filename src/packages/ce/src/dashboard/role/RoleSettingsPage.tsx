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
    Text, TextInput,
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
import {RoleProjectView} from "@edition/dashboard/role/RoleProjectView";
import {RolePermissionView} from "@edition/dashboard/role/RolePermissionView";
import {RoleGeneralAdjustmentView} from "@edition/dashboard/role/RoleGeneralAdjustmentView";

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

    const namespaceIndex = params.namespaceId as any as number
    const roleIndex = params.roleId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const roleId: NamespaceRole['id'] = `gid://sagittarius/NamespaceRole/${roleIndex}`

    const role = React.useMemo(() => roleService.getById(roleId, {namespaceId: namespaceId}), [roleStore, roleId, namespaceId])

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
                <TabList pr={"0.7"}>
                    <TabTrigger value={"general"} asChild>
                        <Button paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>General adjustments</Text>
                        </Button>
                    </TabTrigger>
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
                    <RoleGeneralAdjustmentView/>
                    <RolePermissionView/>
                    <RoleProjectView/>
                </>
            </DLayout>
        </Tab>
    </>
}