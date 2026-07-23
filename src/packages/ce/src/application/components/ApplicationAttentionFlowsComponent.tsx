"use client"

import React from "react";
import {
    Avatar,
    Card,
    DataTable,
    DataTableColumn,
    Flex,
    hashToColor,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowView} from "@edition/flow/services/Flow.view";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {IconChevronRight} from "@tabler/icons-react";
import {formatDistanceToNow} from "date-fns";
import {useRouter} from "next/navigation";

export interface ApplicationAttentionFlowsComponentProps {
    // When omitted, flows across every namespace the user is a member of are
    // considered. When set, only flows inside that namespace are shown.
    namespaceId?: Namespace['id']
}

export const ApplicationAttentionFlowsComponent: React.FC<ApplicationAttentionFlowsComponentProps> = ({namespaceId}) => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const userSession = useUserSession()
    const currentUser = React.useMemo(() => userService.getById(userSession?.user?.id), [userStore, userSession])

    const memberships = React.useMemo(
        () => currentUser?.namespaceMemberships?.nodes ?? [],
        [currentUser?.namespaceMemberships?.nodes?.length]
    )

    const namespaces = React.useMemo(
        () => memberships
            .map(membership => namespaceService.getById(membership?.namespace?.id))
            .filter((namespace): namespace is Namespace => !!namespace)
            .filter(namespace => !namespaceId || namespace.id === namespaceId),
        [memberships.length, namespaceStore, namespaceId]
    )

    const projects = React.useMemo(
        () => namespaces.flatMap(namespace => projectService.values({namespaceId: namespace.id})),
        [namespaces, projectStore]
    )

    const flows = React.useMemo(
        () => projects.flatMap(project => flowService.values({
            namespaceId: project.namespace?.id,
            projectId: project.id,
        })),
        [projects, flowStore]
    )

    const projectNames = React.useMemo(
        () => new Map<string, string>(projects.map(project => [project.id ?? "", project.name ?? ""])),
        [projects]
    )

    const projectNameOf = (flow: FlowView): string =>
        projectNames.get(flow.project?.id ?? "") || "Unknown project"

    const openFlow = (flow: FlowView): void => {
        const namespaceIndex = flow.project?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
        const projectIndex = flow.project?.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
        const flowIndex = flow.id?.match(/Flow\/(\d+)$/)?.[1]
        router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/flow/${flowIndex}`)
    }

    const attentionFlows: FlowView[] = React.useMemo(
        () => flows.filter(flow => flow.validationStatus === "INVALID"),
        [flows]
    )

    if (attentionFlows.length === 0) return null

    const count = attentionFlows.length

    return <Card color={"secondary"} clickable onClick={() => setOpen(previous => !previous)}>
        <Flex align={"center"} justify={"space-between"} style={{gap: "0.75rem"}}>
            <Flex align={"center"} style={{gap: "0.75rem", minWidth: 0}}>
                <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#FFBE0B",
                    flexShrink: 0
                }}/>
                <Text size={"md"}>{count} {count === 1 ? "flow needs" : "flows need"} attention</Text>
            </Flex>
            <IconChevronRight size={16} style={{
                transform: open ? "rotate(90deg)" : "none",
                transition: "transform 0.2s"
            }}/>
        </Flex>
        {open && (
            <div onClick={(e) => e.stopPropagation()}>
                <Spacing spacing={"xl"}/>
                <DataTable data={attentionFlows} onSelect={(flow) => flow && openFlow(flow)}>
                    {(flow) => <>
                        <DataTableColumn>
                            <Text size={"md"}>{flow.name}</Text>
                        </DataTableColumn>
                        <DataTableColumn>
                            <Text size={"sm"} hierarchy={"tertiary"} display={"flex"}
                                  style={{alignItems: "center", gap: "0.35rem"}}>
                                <Avatar size={13} color={hashToColor(projectNameOf(flow), 0, 180)}
                                        identifier={projectNameOf(flow)}/>
                                {projectNameOf(flow)}
                            </Text>
                        </DataTableColumn>
                        <DataTableColumn>
                            <Text size={"sm"} hierarchy={"tertiary"}>
                                {formatDistanceToNow(flow.updatedAt!)} ago
                            </Text>
                        </DataTableColumn>
                    </>}
                </DataTable>
            </div>
        )}
    </Card>
}
