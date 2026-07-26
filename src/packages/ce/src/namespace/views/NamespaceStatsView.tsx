"use client"

import React from "react";
import {Badge, Card, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {IconAlertTriangle, IconTrendingUp} from "@tabler/icons-react";

// Each node run is assumed to save this many seconds of manual work.
const SAVED_SECONDS_PER_NODE_RUN = 60

const withinDays = (time: string | null | undefined, days: number): boolean =>
    !!time && Date.now() - new Date(time).getTime() < days * 24 * 60 * 60 * 1000

export const NamespaceStatsView: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(() => namespaceService.getById(namespaceId), [namespaceStore, namespaceId])

    const projects = React.useMemo(
        () => projectService.values({namespaceId}),
        [projectStore, namespaceId]
    )

    const flows = React.useMemo(
        () => projects.flatMap(project => flowService.values({
            namespaceId: project.namespace?.id,
            projectId: project.id,
        })),
        [projects, flowStore]
    )

    const projectsCount = namespace?.projects?.count ?? 0
    const membersCount = namespace?.members?.count ?? 0

    // Saved work = executed nodes across a set of flows, pressed into whole minutes.
    const savedMinutesOf = (flowSet: typeof flows) => Math.floor(flowSet.reduce((sum, flow) =>
        sum + (flow.nodes?.count ?? 0) * (flow.executionResults?.count ?? 0), 0)
        * SAVED_SECONDS_PER_NODE_RUN / 60)

    const savedMinutes = React.useMemo(() => savedMinutesOf(flows), [flows])

    const invalidFlows = React.useMemo(
        () => flows.filter(flow => flow.validationStatus === "INVALID"),
        [flows]
    )

    // Each badge shows the amount added within the last 30 days ("new this month").
    const trends = React.useMemo(() => {
        const recentFlows = flows.filter(flow => withinDays(flow.createdAt, 30))
        return {
            projects: projects.filter(project => withinDays(project.createdAt, 30)).length,
            savedMinutes: savedMinutesOf(recentFlows),
            invalidFlows: recentFlows.filter(flow => flow.validationStatus === "INVALID").length,
        }
    }, [projects, flows])

    const stats: { label: string, value: number, trend: number, tone: "success" | "warning" }[] = [
        {label: "Projects", value: projectsCount, trend: trends.projects, tone: "success"},
        {label: "Members", value: membersCount, trend: 0, tone: "success"},
        {label: "Saved minutes", value: savedMinutes, trend: trends.savedMinutes, tone: "success"},
        {label: "Invalid flows", value: invalidFlows.length, trend: trends.invalidFlows, tone: "warning"},
    ]

    return <Card color={"secondary"}>
        <Flex align={"center"}>
            {stats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                    <Flex style={{flexDirection: "column", gap: "0.7rem", flex: 1}}>
                        <Flex align={"center"} justify={"space-between"} style={{gap: "0.5rem"}}>
                            <Text size={"sm"} hierarchy={"tertiary"}>{stat.label}</Text>
                            {stat.value !== 0 && stat.trend !== 0 && (
                                <Badge color={stat.tone}>
                                    {stat.tone === "warning"
                                        ? <IconAlertTriangle size={12}/>
                                        : <IconTrendingUp size={12}/>}
                                    {stat.trend}
                                </Badge>
                            )}
                        </Flex>
                        <Text fz={3} style={{lineHeight: 0.9}} fw={600}>{stat.value}</Text>
                    </Flex>
                    {index < stats.length - 1 && (
                        <div style={{
                            width: 1,
                            alignSelf: "stretch",
                            background: "rgba(255,255,255,0.08)",
                            margin: "0 1.5rem",
                        }}/>
                    )}
                </React.Fragment>
            ))}
        </Flex>
    </Card>
}
