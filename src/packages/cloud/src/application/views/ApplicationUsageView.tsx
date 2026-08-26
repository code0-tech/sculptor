"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {isFuture, isPast} from "date-fns";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {UsageIndicatorComponent} from "@edition/usage/components/UsageIndicatorComponent";

const FREE_WORKFLOW_LIMIT = 50
const FREE_AI_LIMIT = 25000

export const ApplicationUsageView: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace["id"] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(
        () => namespaceIndex ? namespaceService.getById(namespaceId) : undefined,
        [namespaceStore, namespaceIndex]
    )

    const hasActiveLicense = namespace?.licenses?.nodes?.some(license =>
        !!license?.startDate && !!license?.endDate && isPast(license.startDate) && isFuture(license.endDate)
    ) ?? false

    const limits = !namespaceIndex || hasActiveLicense
        ? {workflow: undefined, ai: undefined}
        : {workflow: FREE_WORKFLOW_LIMIT, ai: FREE_AI_LIMIT}

    return <UsageIndicatorComponent licenseLevel={"namespace"} limits={limits}/>
}
