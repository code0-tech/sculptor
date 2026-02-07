"use client"

import React from "react";
import {Button, Card, Flex, Spacing, Text, TextInput, toast, useForm, useService, useStore} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {RoleService} from "@edition/role/Role.service";
import type {Namespace, NamespaceRole} from "@code0-tech/sagittarius-graphql-types";
import {useParams} from "next/navigation";

export const RoleGeneralAdjustmentView: React.FC = () => {

    const params = useParams()
    const roleService = useService(RoleService)
    const roleStore = useStore(RoleService)
    const [, startTransition] = React.useTransition()

    const namespaceIndex = params.namespaceId as any as number
    const roleIndex = params.roleId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const roleId: NamespaceRole['id'] = `gid://sagittarius/NamespaceRole/${roleIndex}`

    const role = React.useMemo(() => roleService.getById(roleId, {namespaceId: namespaceId}), [roleStore, roleId, namespaceId])

    const initialValues = React.useMemo(() => {
        return {
            name: role?.name,
        }
    }, [])

    const [inputs, validate] = useForm({
        initialValues: initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            }
        },
        onSubmit: (values) => {
            if (!values.name) return

            startTransition(() => {
                roleService.roleUpdate({
                    namespaceRoleId: roleId,
                    name: values.name!
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({
                            title: "The name were successfully updated.",
                            color: "success",
                            dismissible: true,
                        })
                    }
                })
            })
        }
    })

    return <TabContent pl={"0.7"} value={"general"} style={{overflow: "hidden"}}>
        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                General
            </Text>
            <Button color={"success"} onClick={validate}>
                Save changes
            </Button>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Card color={"secondary"}>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Text size={"md"} hierarchy={"primary"}>Name</Text>
                    <TextInput {...inputs.getInputProps("name")}/>
                </Flex>
            </CardSection>
        </Card>
    </TabContent>
}