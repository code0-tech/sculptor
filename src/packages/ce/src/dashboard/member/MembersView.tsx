"use client"

import React from "react";
import {useParams} from "next/navigation";
import {Button, DNamespaceMemberList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";

export const MembersView: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number

    const membersList = React.useMemo(() => {
        return <DNamespaceMemberList namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    }, [namespaceId])

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Members
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a member..."}/>
                <Link href={`/namespace/${namespaceId}/projects/create`}>
                    <Button color={"success"}>Invite user</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        {membersList}

    </>

}