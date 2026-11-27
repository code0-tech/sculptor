"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useParams, usePathname, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {RoleCreateDialogComponent} from "@edition/role/components/RoleCreateDialogComponent";

export const RoleCreatePage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const settingsHref = `/namespace/${namespaceIndex}/settings`

    return <RoleCreateDialogComponent open={pathname === `/namespace/${namespaceIndex}/roles/create`}
                                      namespaceId={namespaceId}
                                      onOpenChange={(open) => {
                                          if (open) return
                                          closeDialog(router, `${settingsHref}?tab=roles`)
                                      }}/>
}
