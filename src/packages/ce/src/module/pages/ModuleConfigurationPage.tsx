"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useParams, usePathname, useRouter} from "next/navigation";
import {ModuleConfigurationDialogComponent} from "@ce-internal/module/components/ModuleConfigurationDialogComponent";

export const ModuleConfigurationPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const moduleIndex = params.moduleId as any as number
    const moduleHref = `/namespace/${namespaceIndex}/project/${projectIndex}/module`

    return <ModuleConfigurationDialogComponent open={pathname === `${moduleHref}/${moduleIndex}`}
                                               onOpenChange={(open) => {
                                                   if (open) return
                                                   closeDialog(router, moduleHref)
                                               }}/>
}
