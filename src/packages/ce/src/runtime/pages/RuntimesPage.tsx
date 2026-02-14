"use client"

import React from "react";
import {
    Button,
    DRuntimeList,
    Flex,
    Menu, MenuCheckboxItem, MenuContent, MenuPortal, MenuTrigger,
    Spacing,
    Text,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import Link from "next/link";
import {notFound, useParams, useRouter} from "next/navigation";
import {UserService} from "@edition/user/services/User.service";
import {RuntimeDataTableComponent} from "@edition/runtime/components/RuntimeDataTableComponent";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {
    OrganizationDataTableFilterInputComponent
} from "@edition/organization/components/OrganizationDataTableFilterInputComponent";
import {RuntimeDataTableFilterInputComponent} from "@edition/runtime/components/RuntimeDataTableFilterInputComponent";
import {IconMinus, IconSortAscending, IconSortDescending} from "@tabler/icons-react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";

export const RuntimesPage: React.FC = () => {

    const params = useParams()
    const currentSession = useUserSession()
    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])

    const [filter, setFilter] = React.useState<DataTableFilterProps>({})
    const [sort, setSort] = React.useState<DataTableSortProps>({})

    const namespaceIndex = params.namespaceId as any as number

    if (!namespaceIndex && currentUser && !currentUser.admin) {
        notFound()
    }

    const router = useRouter()
    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "1rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Runtimes
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage runtimes that you have access to. Runtimes are the environments where your applications run.
                </Text>
            </Flex>
            <ButtonGroup>
                <Link href={namespaceIndex ? `/namespace/${namespaceIndex}/runtimes/create` : "/runtimes/create"}>
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
            <RuntimeDataTableFilterInputComponent preFilter={(runtime) => namespaceIndex ? true : !runtime?.namespace?.id} namespaceId={namespaceIndex ? `gid://sagittarius/Namespace/${namespaceIndex}` : undefined} onChange={filter => setFilter(filter)}/>
        </div>
        <Spacing spacing={"xl"}/>
        <RuntimeDataTableComponent filter={filter} sort={sort} namespaceId={namespaceIndex ? `gid://sagittarius/Namespace/${namespaceIndex}` : undefined}
                      preFilter={(runtime) => namespaceIndex ? true : !runtime?.namespace?.id} onSelect={(runtime) => {
            const number = runtime?.id?.match(/Runtime\/(\d+)$/)?.[1]
            router.push(namespaceIndex ? `/namespace/${namespaceIndex}/runtimes/${number}/settings` : `/runtimes/${number}/settings`)
        }}/>
    </div>
}