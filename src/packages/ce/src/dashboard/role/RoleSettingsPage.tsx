"use client"

import React from "react";
import {Namespace, NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";
import {Button, Card, CheckboxInput, DLayout, Flex, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {NamespaceService} from "@edition/namespace/Namespace.service";
import {RoleService} from "@edition/role/Role.service";
import {ProjectService} from "@edition/project/Project.service";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {DNamespaceRolePermissions} from "@code0-tech/pictor/dist/components/d-role/DNamespaceRolePermissions";

export const RoleSettingsPage: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const namespaceIndex = params.namespaceId as any as number
    const roleIndex = params.roleId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const roleId: NamespaceRole['id'] = `gid://sagittarius/NamespaceRole/${roleIndex}`

    const namespace = React.useMemo(() => namespaceService.getById(namespaceId), [namespaceStore, namespaceId])
    const role = React.useMemo(() => roleService.getById(roleId, {namespaceId: namespaceId}), [roleStore, roleId, namespaceId])

    const abilityCategoryByAbility: Record<string, string> = {
        ASSIGN_MEMBER_ROLES: "members",
        INVITE_MEMBER: "members",
        DELETE_MEMBER: "members",

        CREATE_NAMESPACE_PROJECT: "projects",
        UPDATE_NAMESPACE_PROJECT: "projects",
        DELETE_NAMESPACE_PROJECT: "projects",
        ASSIGN_ROLE_PROJECTS: "projects",
        READ_NAMESPACE_PROJECT: "projects",

        CREATE_NAMESPACE_ROLE: "roles",
        UPDATE_NAMESPACE_ROLE: "roles",
        ASSIGN_ROLE_ABILITIES: "roles",

        CREATE_RUNTIME: "runtimes",
        UPDATE_RUNTIME: "runtimes",
        DELETE_RUNTIME: "runtimes",
        ROTATE_RUNTIME_TOKEN: "runtimes",
        ASSIGN_PROJECT_RUNTIMES: "runtimes",

        CREATE_FLOW: "flows",
        UPDATE_FLOW: "flows",
        DELETE_FLOW: "flows",

        CREATE_NAMESPACE_LICENSE: "license",
        READ_NAMESPACE_LICENSE: "license",
        DELETE_NAMESPACE_LICENSE: "license",

        UPDATE_ORGANIZATION: "organization",
        DELETE_ORGANIZATION: "organization",

        NAMESPACE_ADMINISTRATOR: "admin",
    }

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
                            <Text size={"md"} hierarchy={"primary"}>Assigned projects</Text>
                        </Button>
                    </TabTrigger>
                </TabList>
            }>
                <>
                    <TabContent value={"permission"}>
                        <Flex justify={"space-between"} align={"end"}>
                            <Text size={"xl"} hierarchy={"primary"}>General adjustments</Text>
                        </Flex>
                        <Spacing spacing={"xxs"}/>
                        <DNamespaceRolePermissions abilities={role?.abilities!!}/>
                        <Spacing spacing={"xl"}/>
                        <Card p={1.3}>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                    <Text size={"md"} hierarchy={"primary"}>Member permissions</Text>
                                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                        <CheckboxInput initialValue={true} label={"Assign member roles"}/>
                                        <CheckboxInput initialValue={true} label={"Rdd member"}/>
                                        <CheckboxInput initialValue={true} label={"Remove member"}/>
                                    </Flex>

                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                    <Text size="md" hierarchy="primary">Project permissions</Text>
                                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                        <CheckboxInput initialValue={true} label="Create project"/>
                                        <CheckboxInput initialValue={true} label="Update project"/>
                                        <CheckboxInput initialValue={true} label="Delete project"/>
                                        <CheckboxInput initialValue={true} label="Assign project roles"/>
                                        <CheckboxInput initialValue={true} label="Read project"/>
                                    </Flex>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                    <Text size="md" hierarchy="primary">Role permissions</Text>
                                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                        <CheckboxInput initialValue={true} label="Create role"/>
                                        <CheckboxInput initialValue={true} label="Update role"/>
                                        <CheckboxInput initialValue={true} label="Assign role abilities"/>
                                    </Flex>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                    <Text size="md" hierarchy="primary">Runtime permissions</Text>
                                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                        <CheckboxInput initialValue={true} label="Create runtime"/>
                                        <CheckboxInput initialValue={true} label="Update runtime"/>
                                        <CheckboxInput initialValue={true} label="Delete runtime"/>
                                        <CheckboxInput initialValue={true} label="Rotate runtime token"/>
                                        <CheckboxInput initialValue={true} label="Assign runtime to projects"/>
                                    </Flex>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                    <Text size="md" hierarchy="primary">Flow permissions</Text>
                                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                        <CheckboxInput initialValue={true} label="Create flow"/>
                                        <CheckboxInput initialValue={true} label="Update flow"/>
                                        <CheckboxInput initialValue={true} label="Delete flow"/>
                                    </Flex>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                    <Text size="md" hierarchy="primary">License permissions</Text>
                                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                        <CheckboxInput initialValue={true} label="Create license"/>
                                        <CheckboxInput initialValue={true} label="Read license"/>
                                        <CheckboxInput initialValue={true} label="Delete license"/>
                                    </Flex>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                    <Text size="md" hierarchy="primary">Organization permissions</Text>
                                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                        <CheckboxInput initialValue={true} label="Update organization"/>
                                        <CheckboxInput initialValue={true} label="Delete organization"/>
                                    </Flex>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                                    <Text size="md" hierarchy="primary">Administrator permissions</Text>
                                    <Flex style={{flexDirection: "column", gap: "0.35rem"}}>
                                        <CheckboxInput initialValue={true} label="Namespace administrator"/>
                                    </Flex>
                                </Flex>
                            </CardSection>
                        </Card>
                        <Spacing spacing={"xl"}/>
                        <Flex justify={"end"}>
                            <Button color={"success"}>
                                Update role
                            </Button>
                        </Flex>
                    </TabContent>
                </>
            </DLayout>
        </Tab>
    </>
}