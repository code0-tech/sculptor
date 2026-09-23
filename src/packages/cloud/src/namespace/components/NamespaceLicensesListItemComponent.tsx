"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {License, Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {LicenseCardComponent} from "@ee-internal/license/components/LicenseCardComponent";

export interface NamespaceLicensesListItemComponentProps {
    namespaceId: Namespace['id']
    licenseId: License['id']
}

export const NamespaceLicensesListItemComponent: React.FC<NamespaceLicensesListItemComponentProps> = (props) => {

    const {namespaceId, licenseId} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const license = React.useMemo(
        () => namespaceService.getById(namespaceId)?.licenses?.nodes?.find(license => license?.id === licenseId) as License,
        [namespaceStore, namespaceId, licenseId]
    )

    const licenseRemove = React.useCallback(() => {
        namespaceService.namespaceLicenseRemove({
            licenseId: licenseId!
        }).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                toast({title: "Deleted license", color: "success"})
            }
        })
    }, [licenseId])

    return <LicenseCardComponent license={license} fallbackName={"Cloud license"} onRemove={licenseRemove}/>
}
