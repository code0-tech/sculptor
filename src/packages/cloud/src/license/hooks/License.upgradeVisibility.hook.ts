"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {differenceInDays} from "date-fns";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";

export const useUpgradeVisibility = (): boolean => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()
    const sessionUser = currentSession?.user
    const [visibilityDays, setVisibilityDays] = React.useState<number>()

    React.useEffect(() => {
        fetch("/api/config")
            .then(response => response.json())
            .then(config => setVisibilityDays(config?.upgradeVisibilityDays))
    }, [])

    const currentUser = React.useMemo(
        () => userService.getById(sessionUser?.id) ?? sessionUser,
        [userStore, userService, sessionUser]
    )

    const createdAt = currentUser?.createdAt

    return visibilityDays !== undefined && !!createdAt
        && differenceInDays(new Date(), new Date(createdAt)) >= visibilityDays
}
