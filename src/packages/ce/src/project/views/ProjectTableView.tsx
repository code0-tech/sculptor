"use client"

import React from "react";
import {
    Avatar,
    Badge,
    Button,
    ButtonGroup,
    Card,
    DataTable,
    DataTableColumn,
    DataTableHeader,
    DataTableHeaderColumn,
    DataTableMaxPaginationValue,
    DataTablePagination,
    DataTablePaginationBackwardsTrigger,
    DataTablePaginationForwardTrigger,
    DataTablePaginationValue,
    Flex,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {
    IconAdjustmentsHorizontal,
    IconArrowsSort,
    IconCheck,
    IconChevronLeft,
    IconChevronRight,
    IconPlus
} from "@tabler/icons-react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {ProjectService} from "@edition/project/services/Project.service";

const filterLabels = {
    all: "All",
    withFlows: "With flows",
    empty: "Empty",
} as const

const sortLabels = {
    name: "Name",
    flows: "Flows",
    createdAt: "Created",
    updatedAt: "Updated",
} as const

export const ProjectTableView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const [filter, setFilter] = React.useState<keyof typeof filterLabels>("all")
    const [sort, setSort] = React.useState<keyof typeof sortLabels>("name")

    const projects = React.useMemo(
        () => projectService.values({namespaceId}),
        [projectStore, namespaceId]
    )

    const decoratedProjects = React.useMemo(() => projects.map(project => ({
        id: project.id,
        name: project.name ?? "",
        flows: project.flows?.count ?? 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    })), [projects])

    const preFilter = React.useCallback((project: (typeof decoratedProjects)[number]) => {
        if (filter === "withFlows") return project.flows > 0
        if (filter === "empty") return project.flows === 0
        return true
    }, [filter])

    const visibleProjects = React.useMemo(
        () => decoratedProjects.filter(preFilter),
        [decoratedProjects, preFilter]
    )

    const sortProps: DataTableSortProps = {[sort]: "asc"}

    return <>
        <Flex align={"center"} justify={"space-between"} style={{gap: "0.5rem"}}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text hierarchy={"tertiary"} size={"md"}>Projects</Text>
                <Badge color={"secondary"}>{visibleProjects.length}</Badge>
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
                            {(Object.keys(filterLabels) as (keyof typeof filterLabels)[]).map((k) => (
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
                            {(Object.keys(sortLabels) as (keyof typeof sortLabels)[]).map((k) => (
                                <MenuItem key={k} onSelect={() => setSort(k)}>
                                    <IconCheck size={13} color={sort === k ? undefined : "transparent"}/>
                                    {sortLabels[k]}
                                </MenuItem>
                            ))}
                        </MenuContent>
                    </MenuPortal>
                </Menu>

                {/* Create */}
                <Link href={`/namespace/${namespaceIndex}/project/create`}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Card color={"secondary"} paddingSize={"sm"}>
            <DataTable data={visibleProjects}
                       sort={sortProps}
                       pagination
                       limit={8}
                       emptyComponent={<DataTableColumn>
                           <Text size={"sm"} hierarchy={"tertiary"}>No projects found.</Text>
                       </DataTableColumn>}
                       onSelect={(project) => {
                           const number = project?.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
                           if (number) router.push(`/namespace/${namespaceIndex}/project/${number}`)
                       }}>
                <DataTableHeader>
                    <DataTableHeaderColumn>
                        <Text size={"sm"} hierarchy={"tertiary"}>Project</Text>
                    </DataTableHeaderColumn>
                    <DataTableHeaderColumn>
                        <Text size={"sm"} hierarchy={"tertiary"}>Flows</Text>
                    </DataTableHeaderColumn>
                </DataTableHeader>
                {(project) => <>
                    <DataTableColumn>
                        <Flex align={"center"} style={{gap: "0.75rem", minWidth: 0}}>
                            <Avatar identifier={project.name} size={13}/>
                            <Text size={"md"}>{project.name}</Text>
                        </Flex>
                    </DataTableColumn>
                    <DataTableColumn>
                        <Text size={"sm"} hierarchy={"tertiary"}>{project.flows} flows</Text>
                    </DataTableColumn>
                </>}
                <DataTablePagination style={{paddingTop: "0.2rem"}}>
                    <Text size={"sm"} hierarchy={"tertiary"}>
                        Page <DataTablePaginationValue/> / <DataTableMaxPaginationValue/>
                    </Text>
                    <ButtonGroup color={"primary"}>
                        <DataTablePaginationBackwardsTrigger asChild>
                            <Button variant={"none"} paddingSize={"xxs"}>
                                <IconChevronLeft size={13}/>
                            </Button>
                        </DataTablePaginationBackwardsTrigger>
                        <DataTablePaginationForwardTrigger asChild>
                            <Button variant={"none"} paddingSize={"xxs"}>
                                <IconChevronRight size={13}/>
                            </Button>
                        </DataTablePaginationForwardTrigger>
                    </ButtonGroup>
                </DataTablePagination>
            </DataTable>
        </Card>
    </>
}
