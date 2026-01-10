"use client"

import React from "react";
import {Breadcrumb, Text} from "@code0-tech/pictor";
import {useParams, usePathname} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";

export const ApplicationBreadcrumbView: React.FC = () => {

    const path = usePathname()
    const params = useParams()

    const namespaceIndex = params.namespaceId as any as number
    const runtimeIndex = params.runtimeId as any as number
    const userId = params.userId as any as number
    const projectId = params.userId as any as number
    const roleId = params.roleId as any as number

    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const pathSegments = path.split("/").filter(pathSegment => pathSegment.length > 0)

    console.log(pathSegments)

    return React.useMemo(() => {
        return <Breadcrumb>
            {pathSegments.map((segment, index) => {
                return <Text key={index}>{segment}</Text>
            })}
        </Breadcrumb>
    }, [pathSegments])
}