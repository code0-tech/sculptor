"use client"

import React from "react";
import {lastPageUrl} from "@core/util/Navigation.lastPage.util";
import {notFound, useParams, useRouter} from "next/navigation";
import {useService, useStore} from "@code0-tech/pictor";
import {User} from "@code0-tech/sagittarius-graphql-types";
import {UserEditDialogComponent} from "@edition/user/components/UserEditDialogComponent";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";

export const UserSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const userIndex = decodeURIComponent(String(params.userId)) as unknown as (number | '@me')
    const isMe = userIndex === "@me"
    const userId: User['id'] | undefined = isMe
        ? currentSession?.user?.id
        : `gid://sagittarius/User/${userIndex}`

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const isSelf = isMe || (!!currentUser && userId === currentUser.id)

    if (currentUser && !isSelf && !currentUser.admin) {
        notFound()
    }

    return <UserEditDialogComponent userId={userId}
                                    open={true}
                                    onOpenChange={(open) => {
                                        if (open) return
                                        if (!isMe) router.replace("/settings?tab=users")
                                        else router.replace(lastPageUrl() ?? "/users/@me")
                                    }}/>
}
