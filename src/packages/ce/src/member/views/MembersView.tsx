"use client"

import React from "react";
import {useParams} from "next/navigation";
import {Button, DataTableFilterProps, DataTableSortProps, Flex, Spacing, Text, ButtonGroup, Menu, MenuTrigger, MenuPortal, MenuContent, MenuCheckboxItem} from "@code0-tech/pictor";
import Link from "next/link";
import {MemberDataTableComponent} from "@edition/member/components/MemberDataTableComponent";
import {MemberDataTableFilterInputComponent} from "@edition/member/components/MemberDataTableFilterInputComponent";
import {IconMinus, IconSortAscending, IconSortDescending} from "@tabler/icons-react";

//TODO: user abilities for add user as member within namespace
export const MembersView: React.FC = () => {

    const params = useParams()
    const namespaceId = params.namespaceId as any as number

    const [filter, setFilter] = React.useState<DataTableFilterProps>({})
    const [sort, setSort] = React.useState<DataTableSortProps>({})

    return <>

        <Flex align={"center"} justify={"space-between"}>
            <Text size={"xl"} hierarchy={"primary"}>
                Members
            </Text>
            <ButtonGroup>
                <Link href={`/namespace/${namespaceId}/members/add`}>
                    <Button color={"success"}>Add user</Button>
                </Link>
                <Menu>
                    <MenuTrigger asChild>
                        <Button color={"secondary"} variant={"filled"}>Sort</Button>
                    </MenuTrigger>
                    <MenuPortal>
                        <MenuContent>
                            <MenuCheckboxItem
                                checked={sort["user.username"] === undefined ? "indeterminate" : sort["user.username"] === "asc"}
                                onSelect={event => {
                                    if (sort["user.username"] === undefined)
                                        setSort(prev => ({...prev, "user.username": "asc"}))
                                    else if (sort["user.username"] === "asc")
                                        setSort(prev => ({...prev, "user.username": "desc"}))
                                    else
                                        setSort(prev => ({...prev, "user.username": undefined}))

                                    event.preventDefault()
                                    event.stopPropagation()
                                }}>
                                {sort["user.username"] === undefined ? <IconMinus size={13}/> : sort["user.username"] === "asc" ?
                                    <IconSortDescending size={13}/> : <IconSortAscending size={13}/>}
                                Username
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
            <MemberDataTableFilterInputComponent namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}
                                                 onChange={filter => setFilter(filter)}/>
        </div>
        <Spacing spacing={"xl"}/>
        <MemberDataTableComponent filter={filter} sort={sort}
                                  namespaceId={`gid://sagittarius/Namespace/${namespaceId}`}/>

    </>

}