"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {ApplicationService} from "@ee-internal/application/services/Application.service";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {LicenseCardComponent} from "@ee-internal/license/components/LicenseCardComponent";
import {isLicenseActive} from "@core/util/license";

export interface ApplicationLicensesListItemComponentProps {
    licenseId: License['id']
}

export const ApplicationLicensesListItemComponent: React.FC<ApplicationLicensesListItemComponentProps> = (props) => {

    const {licenseId} = props

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const license = React.useMemo(
        () => applicationService.get()?.licenses?.nodes?.find(license => license?.id === licenseId) as License,
        [applicationStore, licenseId]
    )

    const active = React.useMemo(
        () => isLicenseActive(license) && applicationService.get()?.currentLicense?.id === licenseId,
        [applicationStore, license, licenseId]
    )

    const licenseRemove = React.useCallback(() => {
        applicationService.applicationLicenseRemove({
            licenseId: licenseId!
        }).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                toast({title: "Deleted license", color: "success"})
            }
        })
    }, [licenseId])

    return <LicenseCardComponent license={license}
                                 fallbackName={"Enterprise Edition license"}
                                 active={active}
                                 onRemove={licenseRemove}/>
}
