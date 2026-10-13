"use client"

import React from "react";
import {lastPageUrl} from "@core/util/Navigation.lastPage.util";
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
                                               router.replace(lastPageUrl() ?? projectHref)
                                           }}/>
}
