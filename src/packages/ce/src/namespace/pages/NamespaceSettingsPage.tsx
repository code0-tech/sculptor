"use client"

import React from "react";
import {lastPageUrl} from "@core/util/Navigation.lastPage.util";
import {useParams, useRouter} from "next/navigation";
import {NamespaceSettingsDialogComponent} from "@edition/namespace/components/NamespaceSettingsDialogComponent";

export const NamespaceSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceHref = `/namespace/${namespaceIndex}`

    return <NamespaceSettingsDialogComponent open={true}
                                             onOpenChange={(open) => {
                                                 if (open) return
                                                 router.replace(lastPageUrl() ?? namespaceHref)
                                             }}/>
}
