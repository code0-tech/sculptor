"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {
    Badge,
    Button,
    ButtonGroup,
    Card,
    Col,
    Flex,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuTrigger,
    Row,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {ModuleService} from "@ce-internal/module/services/Module.service";
import {RuntimeService} from "@ce-internal/runtime/services/Runtime.service";
import {icon, IconString} from "@core/util/icons";
import {
    IconAdjustmentsHorizontal,
    IconAlertTriangle,
    IconArrowsSort,
    IconCheck,
    IconPlus,
    IconSettings
} from "@tabler/icons-react";
import {ProjectService} from "@ce-internal/project/services/Project.service";
import Link from "next/link";

const filterLabels = {
    all: "All",
    configurable: "Configurable",
    functions: "With functions",
} as const

const sortLabels = {
    name: "Name",
    flowTypes: "Events",
    functions: "Functions",
} as const

export const ModuleOverviewPage: React.FC = () => {

    const router = useRouter()
    const params = useParams()
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectId, projectStore]
    )

    const modules = React.useMemo(
        () => moduleService.values({
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [params, namespaceId, projectId, moduleStore, project]
    )

    const [filter, setFilter] = React.useState<keyof typeof filterLabels>("all")
    const [sort, setSort] = React.useState<keyof typeof sortLabels>("name")

    const visibleModules = React.useMemo(() => {
        const filtered = modules.filter(module => {
            if (filter === "configurable") return (module.configurationDefinitions?.count ?? 0) > 0
            if (filter === "functions") return (module.functionDefinitions?.count ?? 0) > 0
            return true
        })
        return [...filtered].sort((a, b) => {
            if (sort === "flowTypes") return (b.flowTypes?.count ?? 0) - (a.flowTypes?.count ?? 0)
            if (sort === "functions") return (b.functionDefinitions?.count ?? 0) - (a.functionDefinitions?.count ?? 0)
            return (a.names?.[0]?.content ?? a.identifier ?? "")
                .localeCompare(b.names?.[0]?.content ?? b.identifier ?? "")
        })
    }, [modules, filter, sort])


    const allModules = React.useMemo(
        () => moduleService.values(),
        [moduleStore]
    )

    const integrationSetupStatus = React.useMemo(() => {
        const result = new Map<string, { severity: "error" | "warning", runtimeNames: string[] }>()
        const assignments = project?.runtimeAssignments?.nodes ?? []
        const primaryRuntimeId = project?.primaryRuntime?.id

        modules.forEach(cardModule => {
            const identifier = cardModule.identifier
            if (!identifier) return

            const runtimeNames: string[] = []
            let primaryUnconfigured = false

            assignments.forEach(assignment => {
                const runtimeId = assignment?.runtime?.id
                if (!runtimeId) return

                const runtimeModule = allModules.find(m => m.runtime?.id === runtimeId && m.identifier === identifier)
                const requiredDefinitions = runtimeModule?.configurationDefinitions?.nodes
                    ?.filter(definition => definition?.optional === false) ?? []

                const unconfigured = requiredDefinitions.some(definition => {
                    const value = assignment?.moduleConfigurations?.nodes
                        ?.find(config => config?.definition?.id === definition?.id)?.value
                    return value === null || value === undefined
                })

                if (unconfigured) {
                    if (runtimeId === primaryRuntimeId) primaryUnconfigured = true
                    runtimeNames.push(runtimeService.getById(runtimeId)?.name ?? "Unknown runtime")
                }
            })

            if (runtimeNames.length > 0) {
                result.set(identifier, {severity: primaryUnconfigured ? "error" : "warning", runtimeNames})
            }
        })

        return result
    }, [modules, allModules, project, runtimeStore])

    return <div style={{
        height: "100%",
        width: "100%",
    }}>
        <ScrollArea h={"100%"} type={"scroll"}>
            <ScrollAreaViewport>
                 <div style={{maxWidth: "52rem", margin: "0 auto", padding: "1rem 1rem"}}>

                    {/* ── section header: count + filter / sort / request ── */}
                    <Flex align={"center"} justify={"space-between"} style={{gap: "0.7rem"}}>
                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                            <Text hierarchy={"secondary"} size={"lg"}>Installed integrations</Text>
                            <Badge color={"secondary"}>{visibleModules.length}</Badge>
                        </Flex>

                        <ButtonGroup>
                            {/* Filter */}
                            <Menu>
                                <MenuTrigger asChild>
                                    <Button variant={"none"} paddingSize={"xxs"} active={filter !== "all"}>
                                        <IconAdjustmentsHorizontal size={13}/>
                                    </Button>
                                </MenuTrigger>
                                <MenuPortal>
                                    <MenuContent sideOffset={8} align={"end"}>
                                        <MenuLabel>Filter</MenuLabel>
                                        {(Object.keys(filterLabels) as (keyof typeof filterLabels)[]).map(k => (
                                            <MenuItem key={k} onSelect={() => setFilter(k)}>
                                                <IconCheck size={13} color={filter === k ? undefined : "transparent"}/>
                                                {filterLabels[k]}
                                            </MenuItem>
                                        ))}
                                    </MenuContent>
                                </MenuPortal>
                            </Menu>

                            {/* Sort */}
                            <Menu>
                                <MenuTrigger asChild>
                                    <Button variant={"none"} paddingSize={"xxs"}>
                                        <IconArrowsSort size={13}/>
                                    </Button>
                                </MenuTrigger>
                                <MenuPortal>
                                    <MenuContent sideOffset={8} align={"end"}>
                                        <MenuLabel>Sort by</MenuLabel>
                                        {(Object.keys(sortLabels) as (keyof typeof sortLabels)[]).map(k => (
                                            <MenuItem key={k} onSelect={() => setSort(k)}>
                                                <IconCheck size={13} color={sort === k ? undefined : "transparent"}/>
                                                {sortLabels[k]}
                                            </MenuItem>
                                        ))}
                                    </MenuContent>
                                </MenuPortal>
                            </Menu>

                            {/* Request */}
                            <Link href={"https://github.com/code0-tech/codezero"} target={"_blank"}>
                                <Button variant={"none"} paddingSize={"xxs"}>
                                    <IconPlus size={13}/>
                                </Button>
                            </Link>
                        </ButtonGroup>
                    </Flex>

                     <Spacing spacing={"xs"}/>
                     <Text size={"md"} hierarchy={"tertiary"} maw={"50%"}>
                         Manage the integrations installed in this project. You can configure existing ones or request new ones.
                     </Text>
                     <Spacing spacing={"md"}/>

                    {/* ── the grid of installed integrations ── */}
                    <Row>
                        {visibleModules.map(module => {

                            const DisplayIcon = icon(module.icon as IconString)
                            const name = module.names?.[0]?.content ?? module.identifier ?? "Integration"
                            const flowTypes = module.flowTypes?.count ?? 0
                            const functions = module.functionDefinitions?.count ?? 0
                            const configurable = (module.configurationDefinitions?.count ?? 0) > 0
                            const setupStatus = integrationSetupStatus.get(module.identifier ?? "")
                            const moduleNumber = module?.id?.match(/RuntimeModule\/(\d+)$/)?.[1]

                            return <Col key={module.id} xs={6} mb={1}>
                                <Card color={"secondary"} paddingSize={"lg"} h={"100%"} clickable={configurable}
                                      onClick={configurable && moduleNumber
                                          ? () => router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/module/${moduleNumber}`)
                                          : undefined}>
                                    <Flex style={{flexDirection: "column", gap: "1.2rem"}}>

                                        {/* identity: icon, name + version + author */}
                                        <Flex align={"center"} style={{gap: "0.8rem", minWidth: 0}}>
                                            <DisplayIcon size={20} color={hashToColor(module.id!)}/>
                                            <Flex style={{flexDirection: "column", gap: "0.35rem", minWidth: 0, flex: 1}}>
                                                <Flex align={"center"} style={{gap: "0.35rem", minWidth: 0}}>
                                                    <Text size={"md"} hierarchy={"primary"} fw={500}>{name}</Text>
                                                    {module.version &&
                                                        <Text size={"xs"} hierarchy={"tertiary"}>v{module.version}</Text>}
                                                </Flex>
                                                {module.author &&
                                                    <Text size={"xs"} hierarchy={"tertiary"}>by @{module.author}</Text>}
                                            </Flex>
                                            {setupStatus &&
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge color={setupStatus.severity}>
                                                            <IconAlertTriangle size={13}
                                                                               style={{minWidth: 13, minHeight: 13}}/>
                                                            {setupStatus.severity === "error" ? "Setup required" : "Setup incomplete"}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipPortal>
                                                        <TooltipContent sideOffset={8} color={"secondary"}>
                                                            <Text size={"sm"}>
                                                                Not fully configured on {setupStatus.runtimeNames.join(", ")}
                                                            </Text>
                                                        </TooltipContent>
                                                    </TooltipPortal>
                                                </Tooltip>}
                                        </Flex>

                                        {/* metadata: one calm, labelled line */}
                                        <Flex align={"center"} style={{gap: "1.2rem"}}>
                                            {flowTypes > 0 &&
                                                <Text size={"sm"} hierarchy={"tertiary"}>
                                                    {flowTypes} Events
                                                </Text>}
                                            {functions > 0 &&
                                                <Text size={"sm"} hierarchy={"tertiary"}>
                                                    {functions} Functions
                                                </Text>}
                                            {configurable &&
                                                <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                    <IconSettings size={15} color={"#70ffb2"}/>
                                                    <Text size={"sm"} hierarchy={"tertiary"}>
                                                        Configurable
                                                    </Text>
                                                </Flex>}
                                        </Flex>
                                    </Flex>
                                </Card>
                            </Col>
                        })}

                        {/* request-integration affordance, matching card footprint */}
                        <Col xs={12} mb={1} mih={"100px"}>
                            <Link href={"https://github.com/code0-tech/codezero"} target={"_blank"}
                                  style={{display: "contents"}}>
                                <Button paddingSize={"lg"} variant={"none"} h={"100%"} w={"100%"} style={{
                                    border: "1px dashed rgba(255,255,255, .15)",
                                }}>
                                    <Flex align={"center"} justify={"center"} style={{
                                        flexDirection: "column",
                                        gap: "0.35rem",
                                        padding: "1.3rem",
                                    }}>
                                        <IconPlus size={18}/>
                                        <Text size={"md"} hierarchy={"tertiary"}>
                                            Missing an integration?
                                        </Text>
                                    </Flex>
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation={"vertical"}>
                <ScrollAreaThumb/>
            </ScrollAreaScrollbar>
        </ScrollArea>
    </div>
}
