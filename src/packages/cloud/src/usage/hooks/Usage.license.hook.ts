"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {UsageLicense} from "@ce-internal/usage/services/Usage.service";
import {isLicenseActive} from "@core/util/license";

export const FREE_WORKFLOW_LIMIT = 50
export const FREE_AI_LIMIT = 25000

export const useUsageLicense = (): UsageLicense => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace["id"] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(
        () => namespaceIndex ? namespaceService.getById(namespaceId) : undefined,
        [namespaceStore, namespaceIndex, namespaceId]
    )

    const license = namespace?.currentLicense
    const active = isLicenseActive(license)

    return {
        license,
        licenseLevel: "namespace",
        resolved: !namespaceIndex || !!namespace,
        licenseStartDate: active ? (license?.startDate ?? undefined) : undefined,
        limits: active
            ? {
                workflow: license?.restrictions?.workflowExecutions ?? undefined,
                ai: license?.restrictions?.aiTokens ?? undefined
            }
            : !namespaceIndex
                ? {workflow: undefined, ai: undefined}
                : {workflow: FREE_WORKFLOW_LIMIT, ai: FREE_AI_LIMIT},
        accessible: !!namespaceIndex
    }
}
