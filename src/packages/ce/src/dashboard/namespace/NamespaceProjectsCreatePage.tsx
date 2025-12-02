"use client"

import React from "react";
import {Button, Col, Flex, Spacing, Text, TextInput, toast, useForm, useService} from "@code0-tech/pictor";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {ProjectService} from "@edition/project/Project.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";

export const NamespaceProjectsCreatePage: React.FC = () => {

    const params = useParams()
    const projectService = useService(ProjectService)
    const [, startTransition] = React.useTransition()
    const router = useRouter()

    const namespaceIndex = params?.namespaceId as string
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex as unknown as number}`

    const [inputs, validate] = useForm({
        initialValues: {
            name: null,
            description: null,
        },
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            },
            description: (value) => {
                if (!value) return "Description is required"
                return null
            }
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
                projectService.projectCreate({
                    name: values.name as unknown as string,
                    description: values.description as unknown as string,
                    namespaceId: namespaceId
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        router.push(`/namespace/${namespaceIndex}/projects`)
                    }
                })
            })
        }
    })

    return <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
        <Col xs={4}>
            <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                Create new project
            </Text>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                Global runtimes are shared runtimes that can be used across multiple organizations.
            </Text>
            <Spacing spacing={"xl"}/>
            <TextInput required
                       title={"Name"}
                       description={"Provide a simple project name"}
                       placeholder={"E.g. User management"}
                       {...inputs.getInputProps("name")}/>
            <Spacing spacing={"xl"}/>
            <TextInput required
                       title={"Description"}
                       description={"Provide a simple project description"}
                       placeholder={"E.g. Manage and authenticate users with rest routes"}
                       {...inputs.getInputProps("description")}/>
            <Spacing spacing={"xl"}/>
            <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                <Link href={"/"}>
                    <Button color={"primary"}>
                        Go back to projects
                    </Button>
                </Link>
                <Button color={"success"} onClick={validate}>
                    Create project
                </Button>
            </Flex>
        </Col>
    </Flex>
}