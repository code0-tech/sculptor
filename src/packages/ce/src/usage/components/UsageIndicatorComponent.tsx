"use client"

import React from "react";
import {
    Button,
    Flex,
    getSize,
    ProgressCircle,
    ProgressLinear,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {addMonths, differenceInMonths, endOfMonth, format, parseISO, startOfMonth} from "date-fns";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {LicenseLevel, UsageLevel, UsageLimits, UsageService} from "@edition/usage/services/Usage.service";

const NEUTRAL_COLOR = "#ffffff"
const WARNING_COLOR = "#FFBE0B"
const DANGER_COLOR = "#D90429"

const RANK: Record<UsageLevel, number> = {application: 0, namespace: 1, project: 2, flow: 3}
const numberFormat = new Intl.NumberFormat()

export interface UsageIndicatorComponentProps {
    licenseLevel?: LicenseLevel
    licenseStartDate?: string
    limits?: UsageLimits
}

export const UsageIndicatorComponent: React.FC<UsageIndicatorComponentProps> = (props) => {

    const {licenseLevel, licenseStartDate, limits = {workflow: undefined, ai: undefined}} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const usageService = useService(UsageService)
    const usageStore = useStore(UsageService)

    const params = useParams()
    const currentSession = useUserSession()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const namespaceId = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const flowId = `gid://sagittarius/Flow/${flowIndex}`

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const overallLevel: UsageLevel = licenseLevel === "namespace" ? "namespace" : "application"
    const contextLevel: UsageLevel = flowIndex ? "flow" : projectIndex ? "project" : namespaceIndex ? "namespace" : "application"
    const contextLabel = contextLevel === "flow" ? "Flow" : contextLevel === "project" ? "Project" : "Namespace"

    const overallAccessible = overallLevel === "application" ? !!currentUser?.admin : !!namespaceIndex

    const now = new Date()
    const licenseStart = licenseStartDate ? parseISO(licenseStartDate) : undefined
    const monthsElapsed = licenseStart ? differenceInMonths(now, licenseStart) : 0
    const periodStart = licenseStart ? addMonths(licenseStart, monthsElapsed) : startOfMonth(now)
    const periodEnd = licenseStart ? addMonths(licenseStart, monthsElapsed + 1) : addMonths(periodStart, 1)
    const afterDate = format(periodStart, "yyyy-MM-dd")
    const beforeDate = format(periodEnd, "yyyy-MM-dd")

    const overallUsage = React.useMemo(() => {
        if (!overallAccessible) return undefined
        return overallLevel === "namespace"
            ? usageService.getNamespaceUsage(namespaceId, {afterDate, beforeDate})
            : usageService.getApplicationUsage({afterDate, beforeDate})
    }, [usageStore, overallLevel, overallAccessible, namespaceId, afterDate, beforeDate])

    const contextUsage = React.useMemo(() => {
        if (RANK[contextLevel] <= RANK[overallLevel]) return undefined
        if (contextLevel === "flow") return usageService.getFlowUsage(namespaceId, projectId, flowId, {afterDate, beforeDate})
        if (contextLevel === "project") return usageService.getProjectUsage(namespaceId, projectId, {afterDate, beforeDate})
        return usageService.getNamespaceUsage(namespaceId, {afterDate, beforeDate})
    }, [usageStore, contextLevel, overallLevel, namespaceId, projectId, flowId, afterDate, beforeDate])

    if (!overallAccessible) return null

    const hasContext = !!contextUsage

    const sections = [
        {title: "Workflow usage", overall: overallUsage?.runtimeCount ?? 0, context: contextUsage?.runtimeCount ?? 0, limit: limits.workflow},
        {title: "AI usage", overall: overallUsage?.aiCount ?? 0, context: contextUsage?.aiCount ?? 0, limit: limits.ai}
    ].map(section => {

        const bounded = section.limit != null && section.limit > 0
        const exhausted = section.limit != null && section.limit <= 0
        const ratio = bounded ? section.overall / section.limit! : 0

        return {
            ...section,
            bounded,
            free: bounded ? Math.max(0, section.limit! - section.overall) : 0,
            overallFill: section.limit == null || exhausted ? 100 : Math.min(100, Math.round(ratio * 100)),
            contextFill: section.limit == null
                ? (section.overall > 0 ? Math.min(100, Math.round((section.context / section.overall) * 100)) : 0)
                : exhausted ? 100 : Math.min(100, Math.round((section.context / section.limit!) * 100)),
            color: bounded
                ? (ratio < 0.75 ? NEUTRAL_COLOR : ratio < 0.9 ? WARNING_COLOR : DANGER_COLOR)
                : exhausted ? DANGER_COLOR : NEUTRAL_COLOR
        }
    })

    return <Tooltip>
        <TooltipTrigger asChild>
            <Button variant={"none"} style={{padding: getSize("xs")}}>
                <Flex w={"16px"} h={"16px"} align={"center"} justify={"center"}>
                    <ProgressCircle style={{position: "absolute"}} value={sections[0].overallFill} color={sections[0].color} size={16}/>
                    <ProgressCircle value={sections[1].overallFill} color={sections[1].color} size={10}/>
                </Flex>
            </Button>
        </TooltipTrigger>
        <TooltipPortal>
            <TooltipContent color={"primary"} side={"left"} sideOffset={8}>
                <Flex style={{flexDirection: "column", gap: getSize("md"), minWidth: "220px"}}>
                    {sections.map((section, index) => {

                        const legend = [
                            hasContext && {label: contextLabel, value: section.context, opacity: 1},
                            {label: "Overall", value: section.overall, opacity: hasContext ? 0.35 : 1},
                            section.bounded && {label: "Free", value: section.free, opacity: 0.12}
                        ].filter(Boolean) as { label: string, value: number, opacity: number }[]

                        return <React.Fragment key={section.title}>
                            {index > 0 && <div style={{height: "1px", background: "rgba(255, 255, 255, 0.08)"}}/>}
                            <Flex style={{flexDirection: "column", gap: getSize("xs")}}>
                                <Flex align={"center"} justify={"space-between"}>
                                    <Text hierarchy={"primary"}>
                                        {section.title}
                                    </Text>
                                    {section.bounded && (
                                        <Text size={"sm"} hierarchy={"tertiary"}>
                                            {numberFormat.format(section.overall)} / {numberFormat.format(section.limit!)}
                                        </Text>
                                    )}
                                </Flex>
                                <ProgressLinear color={section.color} mah={"8px"} w={"100%"}
                                                {...(hasContext
                                                    ? {value: section.contextFill, predictionValue: section.overallFill}
                                                    : {value: section.overallFill})}/>
                                <Flex style={{gap: getSize("lg")}}>
                                    {legend.map(entry => (
                                        <Flex key={entry.label} style={{flexDirection: "column", gap: getSize("xxxs")}}>
                                            <Flex align={"center"} style={{gap: getSize("xs")}}>
                                                <div style={{
                                                    width: getSize("xs"),
                                                    height: getSize("xs"),
                                                    borderRadius: getSize("xxxs"),
                                                    background: section.color,
                                                    opacity: entry.opacity
                                                }}/>
                                                <Text size={"sm"} hierarchy={"tertiary"}>
                                                    {entry.label}
                                                </Text>
                                            </Flex>
                                            <Text size={"sm"}>
                                                {numberFormat.format(entry.value)}
                                            </Text>
                                        </Flex>
                                    ))}
                                </Flex>
                            </Flex>
                        </React.Fragment>
                    })}
                </Flex>
            </TooltipContent>
        </TooltipPortal>
    </Tooltip>
}
