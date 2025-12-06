"use client"

import React from "react";
import {Button, Col, Flex, Spacing, Text, TextInput, toast, useForm, useService} from "@code0-tech/pictor";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {RuntimeService} from "@edition/runtime/Runtime.service";

export const RuntimeCreatePage: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number

    const runtimeService = useService(RuntimeService)
    const [, startTransition] = React.useTransition()
    const [token, setToken] = React.useState<string | null | undefined>(undefined)
    const router = useRouter()

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
                runtimeService.runtimeCreate({
                    name: values.name as unknown as string,
                    description: values.description as unknown as string,
                    ...(namespaceId ? {namespaceId: `gid://sagittarius/Namespace/${namespaceId}`} : {})
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        if (payload?.runtime?.token) {
                            if (!token) setToken(payload.runtime.token)
                        } else {
                            toast({
                                title: "The runtime was created but no token was provided.",
                                color: "error",
                                dismissible: true,
                            })
                            router.push(namespaceId ? `/namespace/${namespaceId}/runtimes` : "/runtimes")
                        }
                    }
                })
            })
        }
    })

    return <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
        <Col xs={4}>
            <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                {!token ? "Create new runtime" : "Runtime created successfully"}
            </Text>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                Runtimes are shared runtimes that can be used across multiple organizations.
            </Text>
            <Spacing spacing={"xl"}/>
            {!token ? (
                <>
                    <TextInput required
                               title={"Name"}
                               description={"Provide a simple runtime name"}
                               placeholder={"E.g. CodeZero Runtime #1"}
                               {...inputs.getInputProps("name")}/>
                    <Spacing spacing={"xl"}/>
                    <TextInput required
                               title={"Description"}
                               description={"Provide a simple runtime description"}
                               placeholder={"E.g. CodeZero main http runtime"}
                               {...inputs.getInputProps("description")}/>
                    <Spacing spacing={"xl"}/>
                </>
            ) : (
                <>
                    <TextInput required
                               title={"Copy token"}
                               value={token}
                               description={"This token is used to link your runtime to our internal system."}/>
                    <Spacing spacing={"xl"}/>
                </>
            )}
            <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                <Link href={namespaceId ? `/namespace/${namespaceId}/runtimes` : "/runtimes"}>
                    <Button color={"primary"}>
                        Go back to runtimes
                    </Button>
                </Link>
                {!token ? (
                    <Button color={"success"} onClick={validate}>
                        Create runtime
                    </Button>
                ) : null}
            </Flex>
        </Col>
    </Flex>
}