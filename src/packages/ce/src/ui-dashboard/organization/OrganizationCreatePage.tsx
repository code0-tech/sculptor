"use client"

import {Button, Col, Flex, Spacing, Text, TextInput, useForm, useService} from "@code0-tech/pictor";
import Link from "next/link";
import {OrganizationService} from "@edition/organization/Organization.service";
import React from "react";
import {useRouter} from "next/navigation";

export const OrganizationCreatePage = () => {

    const organizationService = useService(OrganizationService)
    const [, startTransition] = React.useTransition()
    const router = useRouter()

    const [inputs, validate] = useForm({
        initialValues: {
            name: null,
        },
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            }
        },
        onSubmit: (values) => {
            startTransition(() => {
                organizationService.organizationCreate({
                    name: values.name as unknown as string
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        router.push("/organizations")
                    }
                })
            })
        }
    })

    return <div style={{background: "#070514", height: "100%", padding: "1rem", borderTopLeftRadius: "1rem"}}>
        <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
            <Col xs={4}>
                <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                    Create new organization
                </Text>
                <Spacing spacing={"xs"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    Organizations are helpfully if managing a group of users and plenty of projects.
                </Text>
                <Spacing spacing={"xl"}/>
                <TextInput required
                           title={"Name"}
                           description={"Provide a simple organization name"}
                           placeholder={"E.g. CodeZero"}
                           {...inputs.getInputProps("name")}/>
                <Spacing spacing={"xl"}/>
                <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                    <Link href={"/organizations"}>
                        <Button color={"primary"}>
                            Go back to organizations
                        </Button>
                    </Link>
                    <Button color={"success"} onClick={validate}>
                        Create organization
                    </Button>
                </Flex>
            </Col>
        </Flex>
    </div>
}