"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {getLicensePeriod, isLicenseActive} from "@core/util/license";
import {getUsagesAtRisk, UsageLimitEntry} from "@core/util/usage";
import {LicenseLevel, UsageEntry, UsageLevel, UsageLimits, UsageService} from "@edition/usage/services/Usage.service";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";

const RANK: Record<UsageLevel, number> = {application: 0, namespace: 1, project: 2, flow: 3}

export interface UsageOverview {
    accessible: boolean
    licenseLevel: LicenseLevel
    licensed: boolean
    limits: UsageLimits
    usages: UsageLimitEntry[]
    atRisk: UsageLimitEntry[]
    namespaceIndex: number
    contextLabel: string
    overallUsage: UsageEntry | undefined
    contextUsage: UsageEntry | undefined
}

export const useUsageOverview = (): UsageOverview => {

    const usageService = useService(UsageService)
    const usageStore = useStore(UsageService)
    const params = useParams()

    const {license, licenseLevel, licenseStartDate, limits, accessible, resolved} = useUsageLicense()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const namespaceId = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const flowId = `gid://sagittarius/Flow/${flowIndex}`

    const overallLevel: UsageLevel = licenseLevel === "namespace" ? "namespace" : "application"
    const contextLevel: UsageLevel = flowIndex ? "flow" : projectIndex ? "project" : namespaceIndex ? "namespace" : "application"

    const {afterDate, beforeDate} = getLicensePeriod(licenseStartDate)

    const overallUsage = React.useMemo(() => {
        if (!accessible || !resolved) return undefined
        return overallLevel === "namespace"
            ? usageService.getNamespaceUsage(namespaceId, {afterDate, beforeDate})
            : usageService.getApplicationUsage({afterDate, beforeDate})
    }, [usageStore, overallLevel, accessible, resolved, namespaceId, afterDate, beforeDate])

    const contextUsage = React.useMemo(() => {
        if (!accessible || !resolved || RANK[contextLevel] <= RANK[overallLevel]) return undefined
        if (contextLevel === "flow") return usageService.getFlowUsage(namespaceId, projectId, flowId, {
            afterDate,
            beforeDate
        })
        if (contextLevel === "project") return usageService.getProjectUsage(namespaceId, projectId, {
            afterDate,
            beforeDate
        })
        return usageService.getNamespaceUsage(namespaceId, {afterDate, beforeDate})
    }, [usageStore, accessible, resolved, contextLevel, overallLevel, namespaceId, projectId, flowId, afterDate, beforeDate])

    const usages: UsageLimitEntry[] = [
        {title: "Workflow executions", used: overallUsage?.runtimeCount ?? 0, limit: limits.workflow},
        {title: "AI tokens", used: overallUsage?.aiValue ?? 0, limit: limits.ai}
    ]

    return {
        accessible,
        licenseLevel,
        licensed: isLicenseActive(license),
        limits,
        usages,
        atRisk: getUsagesAtRisk(usages, afterDate, beforeDate),
        namespaceIndex,
        contextLabel: contextLevel === "flow" ? "Flow" : contextLevel === "project" ? "Project" : "Workspace",
        overallUsage,
        contextUsage
    }
}
