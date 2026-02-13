import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Organization} from "@code0-tech/sagittarius-graphql-types";
import {OrganizationDataTableRowComponent} from "@edition/ui-dashboard/organization/OrganizationDataTableRowComponent";
import {OrganizationService} from "@edition/organization/Organization.service";

export interface OrganizationDataTableComponentProps {
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: Organization, index: number) => boolean
    onSelect?: (item: Organization | undefined) => void
}

export const OrganizationDataTableComponent: React.FC<OrganizationDataTableComponentProps> = (props) => {

    const {sort, filter, preFilter = () => true, onSelect} = props

    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)

    const organizations = React.useMemo(
        () => organizationService.values(),
        [organizationStore]
    )

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No organization found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={organizations.map(p => p.json()).filter(preFilter)}>
        {(organization, index) => {
            return <OrganizationDataTableRowComponent organizationId={organization.id}/>
        }}
    </DataTable>

}