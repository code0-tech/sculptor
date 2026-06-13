"use client"

import React from "react";
import {Breadcrumb, Text} from "@code0-tech/pictor";
import {useParams, usePathname} from "next/navigation";

export const ApplicationBreadcrumbView: React.FC = () => {

    const path = usePathname()
    const params = useParams()

    const namespaceIndex = params.namespaceId as string | undefined
    const projectIndex = params.projectId as string | undefined


    console.log(path, path.split("/"), path.split("/").filter(value => value != "").slice(0, path.split("/").length))

    return <Breadcrumb>
        {
            (namespaceIndex || projectIndex) ? (
                <Text hierarchy={"tertiary"}>
                    Home
                </Text>
            ) : null
        }
        {
            (namespaceIndex || projectIndex) ? (
                <Text hierarchy={"tertiary"}>
                    ...
                </Text>
            ) : null
        }
        {
            namespaceIndex && projectIndex ? path.split("/").slice(3, path.split("/").length).map((crumb, index) => {
                return <Text hierarchy={"tertiary"} key={`${crumb}-${index}`}>
                    {crumb}
                </Text>
            }) : namespaceIndex ? path.split("/").slice(1, path.split("/").length).map((crumb, index) => {
                return <Text hierarchy={"tertiary"} key={`${crumb}-${index}`}>
                    {crumb}
                </Text>
            }) : path.split("/").filter(value => value != "").slice(0, path.split("/").length).map((crumb, index) => {
                return <Text hierarchy={"tertiary"} key={`${crumb}-${index}`}>
                    {crumb}
                </Text>
            })
        }
    </Breadcrumb>
}
