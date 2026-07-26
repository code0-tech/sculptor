"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {ProjectSettingsDialogComponent} from "@edition/project/components/ProjectSettingsDialogComponent";

export const ProjectSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const projectHref = `/namespace/${namespaceIndex}/project/${projectIndex}`

    return <ProjectSettingsDialogComponent open={true}
                                           onOpenChange={(open) => {
                                               if (open) return

                                               const nav = (window as unknown as { navigation?: { entries(): { url: string }[], currentEntry?: { index: number } } }).navigation
                                               if (!nav?.entries) {
                                                   router.back()
                                                   return
                                               }

                                               const index = nav.currentEntry?.index ?? 0
                                               if (index > 0) router.back()
                                               else router.push(projectHref)
                                           }}/>
}
