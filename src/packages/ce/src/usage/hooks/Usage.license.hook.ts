"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {UsageLicense} from "@edition/usage/services/Usage.service";

export const useUsageLicense = (): UsageLicense => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    return {
        licenseLevel: "application",
        resolved: true,
        limits: {workflow: undefined, ai: undefined},
        accessible: !!currentUser?.admin
    }
}
