"use client"

import React from "react";
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

                                             const nav = (window as unknown as { navigation?: { entries(): { url: string }[], currentEntry?: { index: number } } }).navigation
                                             if (!nav?.entries) {
                                                 router.back()
                                                 return
                                             }

                                             const index = nav.currentEntry?.index ?? 0
                                             if (index > 0) router.back()
                                             else router.push(fallbackHref)
                                         }}/>
}
