"use client"

import React from "react";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {usePathname, useRouter} from "next/navigation";
import {useService, useStore} from "@code0-tech/pictor";
import {ApplicationService} from "@edition/application/services/Application.service";
import {UserService} from "@edition/user/services/User.service";

export interface ApplicationMiddlewareProps {
    children: React.ReactNode
}

export const ApplicationMiddlewareComponent: React.FC<ApplicationMiddlewareProps> = (props) => {

    const router = useRouter()
    const pathname = usePathname()
    const currentSession = useUserSession()
    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)
    const userService = useService(UserService)
    const userStore = useService(UserService)

    if (currentSession === null) {
        router.push("/login")
        return null
    }

    const user = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [currentSession, userStore]
    )

    const application = React.useMemo(
        () => applicationService.get(),
        [applicationStore]
    )

    if ((user?.admin ?? false) && application && ((application.licenses?.count ?? 0) <= 0) && pathname != "/licenses/add") {
        router.push("/licenses/add")
        return null
    }

    return <>{props.children}</>
}