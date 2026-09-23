"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {isLicenseActive} from "@core/util/license";
import {UpgradeButtonComponent} from "@cloud-internal/license/components/UpgradeButtonComponent";

export const NamespaceUpgradeView: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(
        () => namespaceService.getById(namespaceId),
        [namespaceStore, namespaceId]
    )

    const hasActiveLicense = namespace?.licenses?.nodes?.some(license => isLicenseActive(license)) ?? false

    if (hasActiveLicense) return null

    return <UpgradeButtonComponent namespaceId={namespaceIndex} color={"tertiary"} fullWidth paddingSize={"xxs"}/>
}
