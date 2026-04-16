import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace, NamespaceMember} from "@code0-tech/sagittarius-graphql-types";
import {MemberService} from "@edition/member/services/Member.service";
import {MemberDataTableRowComponent} from "@edition/member/components/MemberDataTableRowComponent";

export interface MemberDataTableComponentProps {
    namespaceId: Namespace['id']
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (project: NamespaceMember, index: number) => boolean
    onSelect?: (item: NamespaceMember | undefined) => void
}

export const MemberDataTableComponent: React.FC<MemberDataTableComponentProps> = (props) => {

    const {namespaceId, sort, filter, preFilter = () => true, onSelect} = props

    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)

    const members = React.useMemo(
        () => memberService.values({namespaceId: namespaceId}),
        [memberStore]
    )

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No member found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={members.map(u => u.json()).filter(preFilter)}>
        {(member, index) => {
            return <MemberDataTableRowComponent memberId={member.id}/>
        }}
    </DataTable>

}