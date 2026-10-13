"use client"

import React from "react";
import {lastPageUrl} from "@core/util/Navigation.lastPage.util";
import {useService, useStore} from "@code0-tech/pictor";
import {notFound, useRouter} from "next/navigation";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {ApplicationSettingsDialogComponent} from "@edition/application/components/ApplicationSettingsDialogComponent";

export const ApplicationSettingsPage: React.FC = () => {

    const router = useRouter()
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

    return <ApplicationSettingsDialogComponent open={true}
                                               onOpenChange={(open) => {
                                                   if (open) return
                                                   router.replace(lastPageUrl() ?? "/")
                                               }}/>
}
