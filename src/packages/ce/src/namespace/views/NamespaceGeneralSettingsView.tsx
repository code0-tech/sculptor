"use client"

import React from "react";
import {Button, Flex, Spacing, Text, TextInput, useForm, useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";

export const NamespaceGeneralSettingsView: React.FC = () => {

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
        useInitialValidation: false,
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
                        toast({title: "Updated organization", color: "success"})
                    }
                })
            })
        }
    })

    return <>
        <Flex justify={"space-between"} align={"center"}>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>General</Text>
            <Button paddingSize={"xxs"} color={"success"} variant={"none"} onClick={validate}>Save changes</Button>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            The name and general settings for this workspace, visible to everyone who has access to it.
        </Text>
        <Spacing spacing={"md"}/>
        <TextInput w={"100%"}
                   title={"Name"}
                   description={"The display name shown for this workspace."}
                   {...inputs.getInputProps("name")}/>
    </>
}