"use client"

import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import Link from "next/link";
import {License, Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {
    NamespaceLicensesDataTableRowComponent
} from "@cloud-internal/namespace/components/NamespaceLicensesDataTableRowComponent";

export interface LicensesDataTableComponentProps {
    namespaceId: Namespace['id']
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: License, index: number) => boolean
    onSelect?: (item: License | undefined) => void
}

export const NamespaceLicensesDataTableComponent: React.FC<LicensesDataTableComponentProps> = (props) => {

    const {namespaceId, sort, filter, preFilter = () => true, onSelect} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const licenses = React.useMemo(
        () => namespaceService.getById(namespaceId)?.licenses?.nodes as License[] ?? [],
        [namespaceStore, namespaceId]
    )

    return <DataTable filter={{}}
                      sort={{}}
                      emptyComponent={<DataTableColumn>
                          <Link href={`/upgrade?namespace=${namespaceId?.match(/Namespace\/(\d+)$/)?.[1]}`}
                                style={{display: "block"}}>
                              <Text>
                                  No license connected yet. Upgrade your plan to unlock the cloud features.
                              </Text>
                          </Link>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={licenses?.filter(preFilter)}>
        {(license, index) => {
            return <NamespaceLicensesDataTableRowComponent namespaceId={namespaceId} licenseId={license?.id}/>
        }}
    </DataTable>

}