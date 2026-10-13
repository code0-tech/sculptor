"use client"

import React from "react";
import {lastPageUrl} from "@core/util/Navigation.lastPage.util";
import {useParams, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {ProjectCreateDialogComponent} from "@edition/project/components/ProjectCreateDialogComponent";

export const NamespaceProjectsCreatePage: React.FC = () => {

    const params = useParams()
    const router = useRouter()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const fallbackHref = `/namespace/${namespaceIndex}`

    return <ProjectCreateDialogComponent open={true}
                                         namespaceId={namespaceId}
                                         onOpenChange={(open) => {
                                             if (open) return
                                             router.replace(lastPageUrl() ?? fallbackHref)
                                         }}/>
}
