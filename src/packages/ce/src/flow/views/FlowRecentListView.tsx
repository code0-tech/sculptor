"use client"

import React from "react";
import {Badge, Button, Flex, hashToColor, Spacing, Text, useService, useStore} from "@code0-tech/pictor";
import Link from "next/link";
import {useParams} from "next/navigation";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {icon, IconString} from "@core/util/icons";

const RECENT_FLOWS_LIMIT = 10

export const FlowRecentListView: React.FC = () => {

    const params = useParams()
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const namespaceNumber = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceNumber}`

    const projects = React.useMemo(
        () => projectService.values({namespaceId})
            .filter((project): project is NamespaceProject => !!project),
        [namespaceId, projectStore]
    )

    const flows = React.useMemo(
        () => projects
            .flatMap(project => project.id
                ? flowService.values({namespaceId, projectId: project.id})
                    .map(flow => ({flow, project}))
                : [])
            .filter((entry): entry is {flow: Flow, project: NamespaceProject} => !!entry.flow?.name)
            .sort((a, b) => new Date(String(b.flow.updatedAt)).getTime() - new Date(String(a.flow.updatedAt)).getTime())
            .slice(0, RECENT_FLOWS_LIMIT),
        [projects, flowStore]
    )

    return <Flex style={{boxSizing: "border-box", flexDirection: 'column'}}>
        <Flex align={"center"} justify={"space-between"}>
            <Text pl={0.7} hierarchy={"tertiary"}>
                Recent workflows
            </Text>
            <Badge color={"secondary"}>
                {flows.length}
            </Badge>
        </Flex>
        <Spacing spacing={"xxs"}/>
        {flows.map(({flow, project}) => {
            const projectNumber = project.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
            const flowNumber = flow.id?.match(/Flow\/(\d+)$/)?.[1]
            const name = flow.name ?? ""
            const displayName = name.split("/").filter(Boolean).pop() ?? name
            return <Link key={flow.id}
                         href={`/namespace/${namespaceNumber}/project/${projectNumber}/flow/${flowNumber}`}
                         style={{width: "100%"}}
                         prefetch>
                <Button variant={"none"} w={"100%"} justify={"flex-start"} paddingSize={"xxs"}>
                    <FlowRecentListIcon flow={flow} project={project}/>
                    <Text size={"md"}>
                        {displayName}
                    </Text>
                </Button>
            </Link>
        })}
    </Flex>
}

const FlowRecentListIcon: React.FC<{flow: Flow, project: NamespaceProject}> = ({flow, project}) => {

    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)

    const flowType = React.useMemo(() => {
        // Populate the flow types for this project's primary runtime, the same way
        // the flow builder does, so getById can resolve the display icon.
        flowTypeService.values({
            runtimeId: project.primaryRuntime?.id,
            projectId: project.id,
            namespaceId: project.namespace?.id,
        })
        return flowTypeService.getById(flow.type?.id)
    }, [flowTypeStore, flow, project])

    const DisplayIcon = icon(flowType?.displayIcon as IconString)

    return <DisplayIcon color={hashToColor(flow?.id ?? "")} size={13}/>
}
