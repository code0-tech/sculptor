"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useService, useStore} from "@code0-tech/pictor";
import {notFound, usePathname, useRouter} from "next/navigation";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {IdentityProviderSettingDialogComponent} from "@edition/application/components/IdentityProviderSettingDialogComponent";

export const IdentityProviderCreatePage: React.FC = () => {

    const router = useRouter()
    const pathname = usePathname()
    const userStore = useStore(UserService)
    const userService = useService(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    if (currentUser && !currentUser.admin) {
        notFound()
    }

    return <IdentityProviderSettingDialogComponent open={pathname === "/settings/identity-providers/create"}
                                            onOpenChange={(open) => {
                                                if (open) return
                                                closeDialog(router, "/settings?tab=identityProviders")
                                            }}/>
}
