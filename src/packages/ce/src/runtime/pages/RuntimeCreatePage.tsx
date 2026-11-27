"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useService, useStore} from "@code0-tech/pictor";
import {notFound, useParams, usePathname, useRouter} from "next/navigation";
import {RuntimeCreateDialogComponent} from "@edition/runtime/components/RuntimeCreateDialogComponent";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";

export const RuntimeCreatePage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()
    const namespaceIndex = params.namespaceId as any as number

    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    if (!namespaceIndex && currentUser && !currentUser.admin) {
        notFound()
    }

    const runtimeCreateHref = namespaceIndex ? `/namespace/${namespaceIndex}/runtimes/create` : "/runtimes/create"
    const runtimesHref = namespaceIndex ? `/namespace/${namespaceIndex}/settings?tab=servers` : "/settings?tab=servers"

    return <RuntimeCreateDialogComponent open={pathname === runtimeCreateHref}
                                         namespaceId={namespaceIndex ? `gid://sagittarius/Namespace/${namespaceIndex}` : undefined}
                                         onOpenChange={(open) => {
                                             if (open) return
                                             closeDialog(router, runtimesHref)
                                         }}/>
}
