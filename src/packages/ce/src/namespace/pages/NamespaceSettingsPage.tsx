"use client"

import React from "react";
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

                                                 const nav = (window as unknown as { navigation?: { entries(): { url: string }[], currentEntry?: { index: number } } }).navigation
                                                 if (!nav?.entries) {
                                                     router.back()
                                                     return
                                                 }

                                                 const index = nav.currentEntry?.index ?? 0
                                                 if (index > 0) router.back()
                                                 else router.push(namespaceHref)
                                             }}/>
}
