"use client"

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
import React from "react";
import {useRouter} from "next/navigation";
import {NamespaceDataTableComponent} from "@edition/namespace/components/NamespaceDataTableComponent";
import {
    NamespaceDataTableFilterInputComponent
} from "@edition/namespace/components/NamespaceDataTableFilterInputComponent";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {IconMinus, IconSortAscending, IconSortDescending} from "@tabler/icons-react";

export const NamespacesView = () => {

    const router = useRouter()

    const [filter, setFilter] = React.useState<DataTableFilterProps>({})
    const [sort, setSort] = React.useState<DataTableSortProps>({})

    return <>
        <Flex justify={"space-between"} align={"start"}>
            <div>
                <Text size={"xl"} fz={2} hierarchy={"primary"}>
                    Workspaces
                </Text>
                <Spacing spacing={"xs"}/>
                <Text hierarchy={"tertiary"}>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor <br/>
                    invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
                    et
                </Text>
            </div>
            <ButtonGroup>
                <Link href={"/workspaces/create"}>
                    <Button color={"success"} paddingSize={"xxs"}>Create</Button>
                </Link>
                <Menu>
                    <MenuTrigger asChild>
                        <Button paddingSize={"xxs"} color={"secondary"} variant={"filled"}>Sort</Button>
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
            <NamespaceDataTableFilterInputComponent onChange={filter => setFilter(filter)}/>
        </div>
        <Spacing spacing={"xl"}/>
        <NamespaceDataTableComponent filter={filter} sort={sort} onSelect={(namespace) => {
            const number = namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
            router.push(`/namespace/${number}`)
        }}/>
    </>

}
