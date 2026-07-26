"use client"

import React from "react";
import {Button, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import {useParams, useRouter} from "next/navigation";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";

export const NamespaceDeleteView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(() => namespaceService.getById(namespaceId), [namespaceStore, namespaceId])
    const parentOrganization = React.useMemo(() => namespace?.parent?.__typename === "Organization" ? organizationService.getById(namespace?.parent?.id) : null, [organizationStore, namespace])

    const [, startTransition] = React.useTransition()


    const deleteOrganization = React.useCallback(() => {
        startTransition(() => {
            organizationService.organizationDelete({
                organizationId: parentOrganization?.id!!
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({title: "Deleted organization", color: "success"})
                }
                router.push("/")
            })
        })
    }, [parentOrganization])

    return <>
        <Text size={"lg"} hierarchy={"primary"} display={"block"}>Delete workspace</Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Permanently delete this workspace and everything in it. This action cannot be undone.
        </Text>
        <Spacing spacing={"md"}/>
        <Button color={"error"} w={"100%"} onClick={deleteOrganization}>Delete workspace</Button>
    </>
}