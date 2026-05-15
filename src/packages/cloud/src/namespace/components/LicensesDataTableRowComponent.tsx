import React from "react";
import {Namespace, NamespaceLicense} from "@code0-tech/sagittarius-graphql-types";
import {DataTableColumn, useService, useStore} from "@code0-tech/pictor";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";

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