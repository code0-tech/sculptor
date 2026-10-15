"use client"

import React from "react";
import {Button, getSize, useService, useStore} from "@code0-tech/pictor";
import {License, Namespace} from "@code0-tech/sagittarius-graphql-types";
import {IconDotsVertical} from "@tabler/icons-react";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {LicenseCardComponent} from "@ee-internal/license/components/LicenseCardComponent";
import {LicenseMenuComponent} from "@cloud-internal/license/components/LicenseMenuComponent";
import {isLicenseActive} from "@core/util/license";

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

    const active = React.useMemo(
        () => isLicenseActive(license) && namespaceService.getById(namespaceId)?.currentLicense?.id === licenseId,
        [namespaceStore, namespaceId, license, licenseId]
    )

    return <LicenseCardComponent license={license}
                                 fallbackName={"Cloud subscription"}
                                 active={active}
                                 actions={<LicenseMenuComponent license={license}
                                                                trigger={<Button style={{padding: getSize("xs")}}>
                                                                    <IconDotsVertical size={13}/>
                                                                </Button>}/>}/>
}
