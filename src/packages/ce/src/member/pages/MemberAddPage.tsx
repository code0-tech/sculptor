"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useParams, usePathname, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {MemberAddDialogComponent} from "@edition/member/components/MemberAddDialogComponent";

export const MemberAddPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const settingsHref = `/namespace/${namespaceIndex}/settings`

    return <MemberAddDialogComponent open={pathname === `/namespace/${namespaceIndex}/members/add`}
                                     namespaceId={namespaceId}
                                     onOpenChange={(open) => {
                                         if (open) return
                                         closeDialog(router, `${settingsHref}?tab=members`)
                                     }}/>
}
