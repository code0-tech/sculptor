"use client"


import React from "react";
import {Button, DNamespaceProjectList, Flex, Spacing, Text} from "@code0-tech/pictor";
import Link from "next/link";
import {useParams} from "next/navigation";

export const NamespaceProjectsView: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number

    const projectsList = React.useMemo(() => {
        return <DNamespaceProjectList namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>
    }, [namespaceId])

    //TODO: user abilities for project creation within namespace

    return <div style={{padding: "0 1.3rem"}}>

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

    </div>
}