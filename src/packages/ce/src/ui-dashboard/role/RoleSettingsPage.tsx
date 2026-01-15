"use client"

import React from "react";
import type {Namespace, NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";
import {Button, DLayout, Flex, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {RoleService} from "@edition/role/Role.service";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {RoleProjectView} from "@edition/ui-dashboard/role/RoleProjectView";
import {RolePermissionView} from "@edition/ui-dashboard/role/RolePermissionView";
import {RoleGeneralAdjustmentView} from "@edition/ui-dashboard/role/RoleGeneralAdjustmentView";
import {RoleDeleteView} from "@edition/ui-dashboard/role/RoleDeleteView";

export const RoleSettingsPage: React.FC = () => {

    //TODO: limit tabs based on user abilities for roles

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
                    <TabTrigger value={"delete"} asChild>
                        <Button color={"error"} paddingSize={"xxs"} variant={"none"}>
                            <Text size={"md"} hierarchy={"primary"}>Delete role forever</Text>
                        </Button>
                    </TabTrigger>
                </TabList>
            }>
                <>
                    <RoleGeneralAdjustmentView/>
                    <RolePermissionView/>
                    <RoleProjectView/>
                    <RoleDeleteView/>
                </>
            </DLayout>
        </Tab>
    </>
}