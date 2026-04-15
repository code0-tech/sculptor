"use client"

import React from "react";
import {Button, Col, Flex, Spacing, Text, TextInput, toast, useForm, useService} from "@code0-tech/pictor";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {RoleService} from "@edition/role/services/Role.service";

export const RoleCreatePage: React.FC = () => {

    //TODO: user abilities for add role within namespace

    const params = useParams()
    const roleService = useService(RoleService)
    const [, startTransition] = React.useTransition()
    const router = useRouter()

    const namespaceIndex = params?.namespaceId as string
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex as unknown as number}`

    //TODO: user abilities for project creation within namespace

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues: {
            name: ""
        },
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                if (value.length < 3) return "Name needs to be at least 3 characters"
                if (value.length > 50) return "Name needs to be less than 50 characters"
                return null
            },
        },
        onSubmit: (values) => {
            startTransition(() => {
                if (!namespaceId) {
                    toast({
                        title: "The current user does not have a personal namespace.",
                        color: "error",
                        dismissible: true,
                    })
                    return
                }
                roleService.roleCreate({
                    name: values.name as unknown as string,
                    namespaceId: namespaceId
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        router.push(`/namespace/${namespaceIndex}/roles`)
                    }
                })
            })
        }
    })

    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
            <Col xs={4}>
                <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                    Create new role
                </Text>
                <Spacing spacing={"xs"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    Global runtimes are shared runtimes that can be used across multiple organizations.
                </Text>
                <Spacing spacing={"xl"}/>
                <TextInput required
                           title={"Name"}
                           description={"Provide a simple role name"}
                           {...inputs.getInputProps("name")}
                />
                <Spacing spacing={"xl"}/>
                <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                    <Link href={`/namespace/${namespaceIndex}/roles`}>
                        <Button color={"primary"}>
                            Go back to roles
                        </Button>
                    </Link>
                    <Button color={"success"} onClick={validate}>
                        Create role
                    </Button>
                </Flex>
            </Col>
        </Flex>
    </div>
}