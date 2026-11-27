"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useParams, usePathname, useRouter} from "next/navigation";
import {RoleSettingsDialogComponent} from "@edition/role/components/RoleSettingsDialogComponent";

export const RoleSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const namespaceIndex = params.namespaceId as any as number
    const roleIndex = params.roleId as any as number
    const settingsHref = `/namespace/${namespaceIndex}/settings`

    return <RoleSettingsDialogComponent open={pathname === `/namespace/${namespaceIndex}/roles/${roleIndex}/settings`}
                                        onOpenChange={(open) => {
                                            if (open) return
                                            closeDialog(router, `${settingsHref}?tab=roles`)
                                        }}/>
}
