"use client"

import {Button, Flex, Spacing, Text} from "@code0-tech/pictor";
import Link from "next/link";
import React from "react";
import {useRouter} from "next/navigation";
import {OrganizationDataTableComponent} from "@edition/ui-dashboard/organization/OrganizationDataTableComponent";
import {
    OrganizationDataTableFilterInputComponent
} from "@edition/ui-dashboard/organization/OrganizationDataTableFilterInputComponent";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";

export const OrganizationsView = () => {

    const router = useRouter()

    const [filter, setFilter] = React.useState<DataTableFilterProps>({})
    const [sort, setSort] = React.useState<DataTableSortProps>({})

    return <>
        <Flex align={"center"} justify={"space-between"}>
            <Flex style={{gap: "0.35rem", flexDirection: "column"}}>
                <Text size={"xl"} hierarchy={"primary"}>
                    Organizations
                </Text>
                <Text size={"sm"} hierarchy={"tertiary"}>
                    Manage organizations that you belong to. You can create new organizations and switch between them.
                </Text>
            </Flex>
            <Flex align={"center"} style={{gap: "0.7rem"}}>
                <Link href={"/organizations/create"}>
                    <Button color={"success"}>Create</Button>
                </Link>
            </Flex>
        </Flex>
        <Spacing spacing={"xl"}/>
        <div style={{width: "100%"}}>
            <OrganizationDataTableFilterInputComponent onChange={filter => setFilter(filter)}/>
        </div>
        <Spacing spacing={"xl"}/>
        {/**TODO: use namespaceId*/}
        <OrganizationDataTableComponent filter={filter} sort={sort} onSelect={(organization) => {
            const number = organization?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
            router.push(`/namespace/${number}`)
        }}/>
    </>

}