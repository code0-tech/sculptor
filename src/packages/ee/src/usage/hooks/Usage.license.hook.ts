"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {ApplicationService} from "@ee-internal/application/services/Application.service";
import {UserService} from "@ce-internal/user/services/User.service";
import {useUserSession} from "@ce-internal/user/hooks/User.session.hook";
import {UsageLicense} from "@ce-internal/usage/services/Usage.service";
import {isLicenseActive} from "@core/util/license";

export const useUsageLicense = (): UsageLicense => {

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentSession = useUserSession()

    const application = React.useMemo(() => applicationService.get(), [applicationStore])
    const license = application?.currentLicense

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const active = isLicenseActive(license)

    return {
        license,
        licenseLevel: "application",
        resolved: !!application,
        licenseStartDate: active ? (license?.startDate ?? undefined) : undefined,
        limits: active
            ? {
                workflow: license?.restrictions?.workflowExecutions ?? undefined,
                ai: license?.restrictions?.aiTokens ?? undefined
            }
            : {workflow: 0, ai: 0},
        accessible: !!currentUser?.admin
    }
}
