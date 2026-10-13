"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {notFound, useParams, useRouter} from "next/navigation";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {IdentityProviderSettingDialogComponent} from "@edition/application/components/IdentityProviderSettingDialogComponent";

export const IdentityProviderSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const identityProviderId = decodeURIComponent(params.identityProviderId as string)

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

    return <IdentityProviderSettingDialogComponent open={true}
                                            identityProviderId={identityProviderId}
                                            onOpenChange={(open) => {
                                                if (open) return
                                                router.replace("/settings?tab=identityProviders")
                                            }}/>
}
