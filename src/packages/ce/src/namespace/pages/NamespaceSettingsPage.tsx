"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useParams, usePathname, useRouter} from "next/navigation";
import {NamespaceSettingsDialogComponent} from "@edition/namespace/components/NamespaceSettingsDialogComponent";

export const NamespaceSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceHref = `/namespace/${namespaceIndex}`

    return <NamespaceSettingsDialogComponent open={pathname === `${namespaceHref}/settings`}
                                             onOpenChange={(open) => {
                                                 if (open) return
                                                 closeDialog(router, namespaceHref)
                                             }}/>
}
