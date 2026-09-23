"use client"

import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import Link from "next/link";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {
    ApplicationLicensesDataTableRowComponent
} from "@ee-internal/application/components/ApplicationLicensesDataTableRowComponent";
import {ApplicationService} from "@edition/application/services/Application.service";

export interface LicensesDataTableComponentProps {
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: License, index: number) => boolean
    onSelect?: (item: License | undefined) => void
}

export const ApplicationLicensesDataTableComponent: React.FC<LicensesDataTableComponentProps> = (props) => {

    const {sort, filter, preFilter = () => true, onSelect} = props

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const licenses = React.useMemo(
        () => applicationService.get()?.licenses?.nodes as License[] ?? [],
        [applicationStore]
    )

    return <DataTable filter={{}}
                      sort={{}}
                      emptyComponent={<DataTableColumn>
                          <Link href={"/licenses/add"} style={{display: "block"}}>
                              <Text>
                                  No license connected yet. Add one to unlock the enterprise features.
                              </Text>
                          </Link>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={licenses?.filter(preFilter)}>
        {(license, index) => {
            return <ApplicationLicensesDataTableRowComponent licenseId={license?.id}/>
        }}
    </DataTable>

}