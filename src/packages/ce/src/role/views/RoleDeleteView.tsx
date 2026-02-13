"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {Button, Card, Flex, Spacing, Text, toast, useService} from "@code0-tech/pictor";
import {RoleService} from "@edition/role/services/Role.service";
import type {NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";

export const RoleDeleteView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const roleService = useService(RoleService)
    const [, startTransition] = React.useTransition()

    const namespaceIndex = params.namespaceId as any as number
    const roleIndex = params.roleId as any as number
    const roleId: NamespaceRole['id'] = `gid://sagittarius/NamespaceRole/${roleIndex}`

    const deleteRole = React.useCallback(() => {
        startTransition(() => {
            roleService.roleDelete({
                namespaceRoleId: roleId
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({
                        title: "The role was successfully deleted.",
                        color: "success",
                        dismissible: true,
                    })
                }
                router.push(`/namespace/${namespaceIndex}/roles`)
            })
        })
    }, [])

    return <TabContent pl={"0.7"} value={"delete"} style={{overflow: "hidden"}}>
        <Text size={"xl"} hierarchy={"primary"}>
            Delete role
        </Text>
        <Spacing spacing={"xl"}/>
        <Card p={1.3} color={"error"}>
            <Flex justify={"space-between"} align={"center"}>
                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        This will delete the role and cannot be undone.
                    </Text>
                </Flex>
                <Button color={"secondary"} variant={"filled"} onClick={deleteRole}>
                    Delete role
                </Button>
            </Flex>
        </Card>
    </TabContent>

}