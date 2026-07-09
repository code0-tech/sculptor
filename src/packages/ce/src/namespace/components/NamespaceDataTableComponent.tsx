import React from "react";
import {DataTable, DataTableColumn, Text, useService, useStore} from "@code0-tech/pictor";
import {DataTableFilterProps, DataTableSortProps} from "@code0-tech/pictor/dist/components/data-table/DataTable";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceDataTableRowComponent} from "@edition/namespace/components/NamespaceDataTableRowComponent";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {MemberService} from "@edition/member/services/Member.service";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {getNamespaceName} from "@edition/namespace/util/Namespace.name.util";

export type NamespaceRow = Namespace & { name?: string }

export interface NamespaceDataTableComponentProps {
    sort?: DataTableSortProps
    filter?: DataTableFilterProps
    preFilter?: (namespace: Namespace, index: number) => boolean
    onSelect?: (item: Namespace | undefined) => void
    minimized?: boolean
}

export const NamespaceDataTableComponent: React.FC<NamespaceDataTableComponentProps> = (props) => {

    const {sort, filter, preFilter = () => true, onSelect, minimized} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const organizationService = useService(OrganizationService)
    const organizationStore = useStore(OrganizationService)
    const memberService = useService(MemberService)
    const memberStore = useStore(MemberService)
    const userService = useService(UserService)
    const userStore = useStore(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, userService, currentSession?.user?.id]
    )

    const memberships = React.useMemo(
        () => currentUser?.namespaceMemberships?.nodes ?? [],
        [currentUser?.namespaceMemberships?.nodes?.length]
    )

    const data = React.useMemo(
        () => memberships.map(membership => {
            const namespace = namespaceService.getById(membership?.namespace?.id)
            if (!namespace) return undefined

            const members = memberService.values({namespaceId: namespace.id})
            const row: NamespaceRow = {
                ...namespace,
                name: getNamespaceName(namespace, organizationService, userService),
                members: {
                    ...namespace.members,
                    nodes: members,
                }
            }
            return row
        }).filter((namespace): namespace is NamespaceRow => !!namespace).filter(preFilter),
        [memberships.length, namespaceStore, memberStore, organizationStore, userStore, preFilter]
    )

    return <DataTable filter={filter}
                      sort={sort}
                      emptyComponent={<DataTableColumn>
                          <Text>
                              No workspace found. Create one to get started.
                          </Text>
                      </DataTableColumn>}
                      onSelect={(item) => item && onSelect?.(item)}
                      data={data}>
        {(namespace, index) => {
            return <NamespaceDataTableRowComponent minimized={minimized} namespaceId={namespace.id}/>
        }}
    </DataTable>

}
