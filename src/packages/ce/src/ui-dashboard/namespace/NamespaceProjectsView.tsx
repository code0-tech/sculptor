"use client"


import React from "react";
import {Button, DNamespaceProjectList, Flex, Spacing, Text} from "@code0-tech/pictor";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";

export const NamespaceProjectsView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const namespaceId = params.namespaceId as any as number

    const projectsList = React.useMemo(() => {
        return <DNamespaceProjectList color={"secondary"} onSelect={(project) => {
            const number = project.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
            router.push(`/namespace/${namespaceId}/project/${number}/flow`)
        }} namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    }, [namespaceId])

    //TODO: user abilities for project creation within namespace

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Projects
            </Text>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={`/namespace/${namespaceId}/projects/create`}>
                    <Button color={"success"}>Create project</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        {projectsList}

    </>
}