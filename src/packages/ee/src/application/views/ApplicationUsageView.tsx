"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {isFuture, isPast} from "date-fns";
import {ApplicationService} from "@edition/application/services/Application.service";
import {UsageIndicatorComponent} from "@edition/usage/components/UsageIndicatorComponent";

export const ApplicationUsageView: React.FC = () => {

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const application = React.useMemo(() => applicationService.get(), [applicationStore])
    const license = application?.currentLicense

    const hasActiveLicense = !!license?.startDate && !!license?.endDate
        && isPast(license.startDate) && isFuture(license.endDate)

    return <UsageIndicatorComponent
        licenseLevel={"application"}
        licenseStartDate={hasActiveLicense ? (license?.startDate ?? undefined) : undefined}
        limits={hasActiveLicense ? {workflow: undefined, ai: undefined} : {workflow: 0, ai: 0}}
    />
}
