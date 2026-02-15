"use client"

import React from "react";
import {Button, Card, Flex, Spacing, Text, useService, useStore, toast} from "@code0-tech/pictor";
import {useParams, useRouter} from "next/navigation";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";

export const OrganizationDeleteView: React.FC = () => {

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
                    toast({
                        title: "The organization was successfully deleted.",
                        color: "success",
                        dismissible: true,
                    })
                }
                router.push("/")
            })
        })
    }, [parentOrganization])

    return <>
        <Flex justify={"space-between"} align={"end"}>
            <Text size={"xl"} hierarchy={"primary"}>Delete organization</Text>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Card p={1.3} color={"error"}>
            <Flex justify={"space-between"} align={"center"}>
                <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        This will delete the organization and cannot be undone.
                    </Text>
                </Flex>
                <Button color={"secondary"} variant={"filled"} onClick={deleteOrganization}>
                    Delete organization forever
                </Button>
            </Flex>
        </Card>
    </>
}