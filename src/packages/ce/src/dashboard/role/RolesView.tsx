"use client"

import React from "react";
import {useParams} from "next/navigation";
import {Button, DNamespaceMemberList, DNamespaceRoleList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";

export const RolesView: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number

    const rolesList = React.useMemo(() => {
        return <DNamespaceRoleList namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    }, [namespaceId])

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Roles
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a role..."}/>
                <Link href={`/namespace/${namespaceId}/projects/create`}>
                    <Button color={"success"}>Create role</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        {rolesList}

    </>

}