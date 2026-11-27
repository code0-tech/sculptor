"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useParams, usePathname, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {ProjectCreateDialogComponent} from "@edition/project/components/ProjectCreateDialogComponent";

export const NamespaceProjectsCreatePage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const fallbackHref = `/namespace/${namespaceIndex}`

    return <ProjectCreateDialogComponent open={pathname === `${fallbackHref}/project/create`}
                                         namespaceId={namespaceId}
                                         onOpenChange={(open) => {
                                             if (open) return
                                             closeDialog(router, fallbackHref)
                                         }}/>
}
