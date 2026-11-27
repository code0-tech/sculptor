"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useService, useStore} from "@code0-tech/pictor";
import {notFound, usePathname, useRouter} from "next/navigation";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {UserCreateDialogComponent} from "@edition/user/components/UserCreateDialogComponent";

export const UserInvitePage: React.FC = () => {

    const router = useRouter()
    const pathname = usePathname()
    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    if (currentUser && !currentUser.admin) {
        notFound()
    }

    return <UserCreateDialogComponent open={pathname === "/users/invite"}
                                      onOpenChange={(open) => {
                                          if (open) return
                                          closeDialog(router, "/settings?tab=users")
                                      }}/>
}
