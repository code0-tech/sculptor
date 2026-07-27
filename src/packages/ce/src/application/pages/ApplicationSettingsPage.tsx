"use client"

import React from "react";
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

                                                   const nav = (window as unknown as { navigation?: { entries(): { url: string }[], currentEntry?: { index: number } } }).navigation
                                                   if (!nav?.entries) {
                                                       router.back()
                                                       return
                                                   }

                                                   const index = nav.currentEntry?.index ?? 0
                                                   if (index > 0) router.back()
                                                   else router.push("/")
                                               }}/>
}
