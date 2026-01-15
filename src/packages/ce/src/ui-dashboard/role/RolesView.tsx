"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {Button, DNamespaceMemberList, DNamespaceRoleList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";

export const RolesView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const namespaceId = params.namespaceId as any as number

    const rolesList = React.useMemo(() => {
        return <DNamespaceRoleList onSetting={(role) => {
            const roleIndex = role.id?.match(/NamespaceRole\/(\d+)$/)?.[1]
            router.push(`/namespace/${namespaceId}/roles/${roleIndex}/settings`)
        }} namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    }, [namespaceId])

    //TODO: user abilities for add role within namespace

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Roles
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={`/namespace/${namespaceId}/roles/create`}>
                    <Button color={"success"}>Create role</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        {rolesList}

    </>

}