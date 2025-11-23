"use client"

import React from "react";
import {
    Button,
    Col,
    Flex,
    Spacing,
    Text,
    TextInput,
    toast,
    useForm,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ProjectService} from "@edition/project/Project.service";
import {UserService} from "@edition/user/User.service";

export const ApplicationPersonalProjectCreatePage: React.FC = () => {

    const currentSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const projectService = useService(ProjectService)
    const [, startTransition] = React.useTransition()
    const router = useRouter()

    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [currentSession, userStore])

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
                if (!currentUser?.namespace?.id) {
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
                    namespaceId: currentUser.namespace.id
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        router.push("/")
                        //router.push(`/namespace/${currentUser.namespace?.id}`)
                    }
                })
            })
        }
    })

    return <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
        <Col xs={4}>
            <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                Create new personal project
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
                        Go back to project overview
                    </Button>
                </Link>
                <Button color={"success"} onClick={validate}>
                    Create personal project
                </Button>
            </Flex>
        </Col>
    </Flex>
}