"use client"

import React from "react";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {Button, Card, Flex, Spacing, Text, TextInput, toast, useForm, useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";

export const OrganizationGeneralSettingsView: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(() => namespaceService.getById(namespaceId), [namespaceStore, namespaceId])
    const parentOrganization = React.useMemo(() => namespace?.parent?.__typename === "Organization" ? organizationService.getById(namespace?.parent?.id) : null, [organizationStore, namespace])

    const [, startTransition] = React.useTransition()

    const initialValues = React.useMemo(() => ({
        name: parentOrganization?.name,
    }), [parentOrganization])

    const [inputs, validate] = useForm({
        initialValues: initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            },
        },
        onSubmit: (values) => {
            startTransition(() => {
                organizationService.organizationUpdate({
                    name: values.name!!,
                    organizationId: parentOrganization?.id!!
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({
                            title: "The organization was successfully updated.",
                            color: "success",
                            dismissible: true,
                        })
                    }
                })
            })
        }
    })

    return <>
        <Flex justify={"space-between"} align={"center"}>
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
                    <Text size={"md"} hierarchy={"primary"}>
                        Name
                    </Text>
                    <TextInput {...inputs.getInputProps("name")}/>
                </Flex>
            </CardSection>
        </Card>
    </>
}