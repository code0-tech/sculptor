import React from "react";
import {Namespace, NamespaceLicense, Organization} from "@code0-tech/sagittarius-graphql-types";
import {Avatar, Button, DataTableColumn, Flex, hashToColor, Text, useService, useStore} from "@code0-tech/pictor";
import {IconLogout} from "@tabler/icons-react";
import {OrganizationService} from "@edition/organization/services/Organization.service";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {MemberService} from "@edition/member/services/Member.service";
import {UserService} from "@edition/user/services/User.service";
import {formatDistanceToNow} from "date-fns";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {OrganizationView} from "@edition/organization/services/Organization.view";

export interface LicensesDataTableRowComponentProps {
    namespaceId: Namespace['id']
    licenseId: NamespaceLicense['id']
}

export const LicensesDataTableRowComponent: React.FC<LicensesDataTableRowComponentProps> = (props) => {

    const {namespaceId, licenseId} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const license = React.useMemo(
        () => namespaceService.getById(namespaceId)?.namespaceLicenses?.nodes?.find(license => license?.id === licenseId) as NamespaceLicense,
        [namespaceStore, namespaceId, licenseId]
    )

    //TODO: fetch license details from the license service and display them here

    return <>
        <DataTableColumn>

        </DataTableColumn>
    </>
}