"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useParams, usePathname, useRouter} from "next/navigation";
import {ProjectSettingsDialogComponent} from "@edition/project/components/ProjectSettingsDialogComponent";

export const ProjectSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const projectHref = `/namespace/${namespaceIndex}/project/${projectIndex}`

    return <ProjectSettingsDialogComponent open={pathname === `${projectHref}/settings`}
                                           onOpenChange={(open) => {
                                               if (open) return
                                               closeDialog(router, projectHref)
                                           }}/>
}
