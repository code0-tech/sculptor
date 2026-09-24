"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {differenceInDays} from "date-fns";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";

export const UPGRADE_VISIBILITY_DAYS = 7

export const useUpgradeVisibility = (): boolean => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()
    const sessionUser = currentSession?.user

    const currentUser = React.useMemo(
        () => userService.getById(sessionUser?.id) ?? sessionUser,
        [userStore, userService, sessionUser]
    )

    const createdAt = currentUser?.createdAt

    return !!createdAt && differenceInDays(new Date(), new Date(createdAt)) >= UPGRADE_VISIBILITY_DAYS
}
