"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";

export const useLicensePurchased = (): boolean => {

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, userService, currentSession?.user?.id]
    )

    const memberships = React.useMemo(
        () => currentUser?.namespaceMemberships?.nodes ?? [],
        [currentUser?.namespaceMemberships?.nodes]
    )

    return React.useMemo(
        () => memberships.some(membership => {
            const id = membership?.namespace?.id
            return !!id && (namespaceService.getById(id)?.licenses?.count ?? 0) > 0
        }),
        [namespaceStore, namespaceService, memberships]
    )
}
