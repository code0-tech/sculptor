"use client"

import React from "react";
import {lastPageUrl} from "@core/util/Navigation.lastPage.util";
import {useParams, useRouter} from "next/navigation";
import {ModuleConfigurationDialogComponent} from "@ce-internal/module/components/ModuleConfigurationDialogComponent";

export const ModuleConfigurationPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const moduleHref = `/namespace/${namespaceIndex}/project/${projectIndex}/module`

    return <ModuleConfigurationDialogComponent open={true}
                                               onOpenChange={(open) => {
                                                   if (open) return
                                                   router.replace(lastPageUrl() ?? moduleHref)
                                               }}/>
}
