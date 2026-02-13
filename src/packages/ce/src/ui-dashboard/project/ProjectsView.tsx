"use client"


import React from "react";
import {
    Button,
    Flex,
    Menu,
    MenuCheckboxItem,
    MenuContent,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text
} from "@code0-tech/pictor";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {ProjectDataTableComponent} from "@edition/ui-dashboard/project/ProjectDataTableComponent";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconMinus, IconSortAscending, IconSortDescending} from "@tabler/icons-react";
import {ProjectDataTableFilterInputComponent} from "@edition/ui-dashboard/project/ProjectDataTableFilterInputComponent";

//TODO: user abilities for project creation within namespace
export const ProjectsView: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const namespaceId = params.namespaceId as any as number

    const [filter, setFilter] = React.useState<DataTableFilterProps>({})
    const [sort, setSort] = React.useState<DataTableSortProps>({})

    const projectsList = React.useMemo(() => {
        return <ProjectDataTableComponent namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}
                                          filter={filter}
                                          sort={sort}
                                          onSelect={(project) => {
                                              const number = project?.id?.match(/NamespaceProject\/(\d+)$/)?.[1]
                                              router.push(`/namespace/${namespaceId}/project/${number}/flow`)
                                          }}/>
    }, [namespaceId, filter, sort])

    return <>

        <Flex align={"center"} style={{gap: "0.35rem"}} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Projects
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage projects that you belong to. You can create new projects and switch between them.
                </Text>
            </Flex>
            <ButtonGroup>
                <Link href={`/namespace/${namespaceId}/projects/create`}>
                    <Button color={"success"}>Create</Button>
                </Link>
                <Menu>
                    <MenuTrigger asChild>
                        <Button color={"secondary"} variant={"filled"}>Sort</Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent>
                            <MenuCheckboxItem
                                checked={sort["name"] === undefined ? "indeterminate" : sort["name"] === "asc"}
                                onSelect={event => {
                                    if (sort["name"] === undefined)
                                        setSort(prev => ({...prev, name: "asc"}))
                                    else if (sort["name"] === "asc")
                                        setSort(prev => ({...prev, name: "desc"}))
                                    else
                                        setSort(prev => ({...prev, name: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["name"] === undefined ? <IconMinus size={13}/> : sort["name"] === "asc" ?
                                    <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Name
                            </MenuCheckboxItem>
                            <MenuCheckboxItem
                                checked={sort["createdAt"] === undefined ? "indeterminate" : sort["createdAt"] === "asc"}
                                onSelect={event => {
                                    if (sort["createdAt"] === undefined)
                                        setSort(prev => ({...prev, createdAt: "asc"}))
                                    else if (sort["createdAt"] === "asc")
                                        setSort(prev => ({...prev, createdAt: "desc"}))
                                    else
                                        setSort(prev => ({...prev, createdAt: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["createdAt"] === undefined ?
                                    <IconMinus size={13}/> : sort["createdAt"] === "asc" ?
                                        <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Created At
                            </MenuCheckboxItem>
                            <MenuCheckboxItem
                                checked={sort["updatedAt"] === undefined ? "indeterminate" : sort["updatedAt"] === "asc"}
                                onSelect={event => {
                                    if (sort["updatedAt"] === undefined)
                                        setSort(prev => ({...prev, updatedAt: "asc"}))
                                    else if (sort["updatedAt"] === "asc")
                                        setSort(prev => ({...prev, updatedAt: "desc"}))
                                    else
                                        setSort(prev => ({...prev, updatedAt: undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["updatedAt"] === undefined ?
                                    <IconMinus size={13}/> : sort["updatedAt"] === "asc" ?
                                        <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Updated At
                            </MenuCheckboxItem>
                        </MenuContent>
                    </MenuPortal>
                </Menu>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xl"}/>
        <div style={{width: "100%"}}>
            <ProjectDataTableFilterInputComponent namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}
                                                  onChange={filter => setFilter(filter)}/>
        </div>
        <Spacing spacing={"xl"}/>
        {projectsList}

    </>
}