"use client"

import React from "react";
import {
    Badge,
    Button,
    ButtonGroup,
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
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {IconAdjustmentsHorizontal, IconArrowsSort, IconCheck, IconPlus} from "@tabler/icons-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Runtime} from "@code0-tech/sagittarius-graphql-types";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {RuntimeDataTableComponent} from "@edition/runtime/components/RuntimeDataTableComponent";

const filterLabels = {
    all: "All",
    connected: "Connected",
    disconnected: "Disconnected",
} as const

const sortLabels = {
    name: "Name",
    createdAt: "Created",
    updatedAt: "Updated",
} as const

// Global runtimes are the ones not bound to a namespace.
const isGlobal = (runtime: Runtime) => !runtime?.namespace?.id

export const ApplicationServersView: React.FC = () => {

    const router = useRouter()
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const runtimes = React.useMemo(() => runtimeService.values(), [runtimeStore])

    const [filter, setFilter] = React.useState<keyof typeof filterLabels>("all")
    const [sort, setSort] = React.useState<keyof typeof sortLabels>("name")

    const preFilter = React.useCallback((runtime: Runtime) => {
        if (!isGlobal(runtime)) return false
        if (filter === "connected") return runtime.status === "CONNECTED"
        if (filter === "disconnected") return runtime.status !== "CONNECTED"
        return true
    }, [filter])

    const visibleCount = React.useMemo(() => runtimes.filter(preFilter).length, [runtimes, preFilter])

    const sortProps: DataTableSortProps = {[sort]: "asc"}

    return <TabContent value={"servers"}>
        <Flex justify={"space-between"} align={"center"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Servers</Text>
                <Badge color={"secondary"}>{visibleCount}</Badge>
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

                {/* Create */}
                <Link href={"/runtimes/create"}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Global runtimes are the environments where your applications run. These are available across all workspaces.
        </Text>
        <Spacing spacing={"md"}/>
        <RuntimeDataTableComponent sort={sortProps}
                                   preFilter={preFilter}
                                   onSelect={(runtime) => {
                                       const number = runtime?.id?.match(/Runtime\/(\d+)$/)?.[1]
                                       if (number) router.push(`/runtimes/${number}/settings`)
                                   }}/>
    </TabContent>
}
