import React from "react";
import {License, Namespace} from "@code0-tech/sagittarius-graphql-types";
import {Badge, Button, DataTableColumn, Flex, Text, useService, useStore} from "@code0-tech/pictor";
import {formatDistanceToNow} from "date-fns";
import {IconX} from "@tabler/icons-react";
import {NamespaceService} from "@cloud-internal/namespace/services/Namespace.service";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {getLicenseName, isLicenseActive} from "@core/util/license";
import {LicenseRestrictionsComponent} from "@ee-internal/license/components/LicenseRestrictionsComponent";
import {LicenseBillingComponent} from "@ee-internal/license/components/LicenseBillingComponent";

export interface LicensesDataTableRowComponentProps {
    namespaceId: Namespace['id']
    licenseId: License['id']
}

export const NamespaceLicensesDataTableRowComponent: React.FC<LicensesDataTableRowComponentProps> = (props) => {

    const {namespaceId, licenseId} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const license = React.useMemo(
        () => namespaceService.getById(namespaceId)?.licenses?.nodes?.find(license => license?.id === licenseId) as License,
        [namespaceStore, namespaceId, licenseId]
    )

    const licenseRemove = React.useCallback(() => {
        namespaceService.namespaceLicenseRemove({
            licenseId: licenseId!
        }).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                toast({title: "Deleted license", color: "success"})
            }
        })
    }, [])

    return <>
        <DataTableColumn pr={2.5}>
            <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                <Flex align={"center"} style={{gap: "0.35rem"}}>
                    <Text size={"xl"} hierarchy={"primary"}>
                        {getLicenseName(license, "Cloud license")}
                    </Text>
                    {isLicenseActive(license) ? (
                        <Badge color={"success"}>
                            <Text style={{color: "inherit"}}>
                                Active
                            </Text>
                        </Badge>
                    ) : (
                        <Badge>
                            <Text>
                                Not active
                            </Text>
                        </Badge>
                    )}
                </Flex>
                <Flex style={{flexDirection: "column", gap: "0.35rem", textWrap: "nowrap"}}>
                    <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                        Active since
                        <Badge color={"secondary"}>
                            <Text>
                                {license?.startDate ? formatDistanceToNow(license.startDate, {addSuffix: true}) : "unknown"}
                            </Text>
                        </Badge>
                    </Text>
                    <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                        and active until
                        <Badge color={"secondary"}>
                            <Text>
                                {license?.endDate ? formatDistanceToNow(license.endDate, {addSuffix: true}) : "further notice"}
                            </Text>
                        </Badge>
                    </Text>
                </Flex>
            </Flex>
        </DataTableColumn>
        <DataTableColumn pr={2.5}>
            <LicenseRestrictionsComponent license={license}/>
        </DataTableColumn>
        <DataTableColumn pr={2.5}>
            <LicenseBillingComponent license={license}/>
        </DataTableColumn>
        <DataTableColumn>
            <Button color={"error"} variant={"none"} onClick={licenseRemove}>
                <IconX size={16}/>
            </Button>
        </DataTableColumn>
    </>
}
