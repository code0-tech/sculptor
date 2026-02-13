import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Organization} from "@code0-tech/sagittarius-graphql-types";
import {OrganizationDataTableRowComponent} from "@edition/organization/components/OrganizationDataTableRowComponent";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {MemberService} from "@edition/member/services/Member.service";

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
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)

    const organizations = React.useMemo(
        () => organizationService.values(),
        [organizationStore]
    )

    const data = React.useMemo(
        () => organizations.map(
            o => o.json()
        ).filter(preFilter).map(o => {
            const members = memberService.values({namespaceId: o.namespace?.id})
            const organization: Organization = {
                ...o,
                namespace: {
                    ...o.namespace,
                    members: {
                        nodes: members.map(m => m.json()),
                    }
                }
            }
            return organization
        }),
        [organizations, memberStore, preFilter]
    )

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No organization found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={data}>
        {(organization, index) => {
            return <OrganizationDataTableRowComponent organizationId={organization.id}/>
        }}
    </DataTable>

}