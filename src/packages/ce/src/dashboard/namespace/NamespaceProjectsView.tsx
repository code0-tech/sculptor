"use client"


import React from "react";
import {Button, DNamespaceProjectList, Flex, Spacing, Text, TextInput} from "@code0-tech/pictor";
import {IconSearch} from "@tabler/icons-react";
import Link from "next/link";
import {useParams} from "next/navigation";

export const NamespaceProjectsView: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number

    const projectsList = React.useMemo(() => {
        return <DNamespaceProjectList namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    }, [namespaceId])

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Projects
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <TextInput left={<IconSearch size={16}/>} placeholder={"Find a project..."}/>
                <Link href={"/projects/create"}>
                    <Button color={"success"}>Create project</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        {projectsList}

    </>
}