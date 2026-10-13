"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {RoleSettingsDialogComponent} from "@edition/role/components/RoleSettingsDialogComponent";

export const RoleSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()

    const namespaceIndex = params.namespaceId as any as number
    const settingsHref = `/namespace/${namespaceIndex}/settings`

    return <RoleSettingsDialogComponent open={true}
                                        onOpenChange={(open) => {
                                            if (open) return
                                            router.replace(`${settingsHref}?tab=roles`)
                                        }}/>
}
