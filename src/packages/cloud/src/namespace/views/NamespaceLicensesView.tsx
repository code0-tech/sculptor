"use client"

import React from "react";
import {
    AuroraBackground,
    Badge,
    Button,
    ButtonGroup,
    Card,
    Flex,
    Spacing,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import Link from "next/link";
import {IconPlus, IconShoppingCart} from "@tabler/icons-react";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {
    NamespaceLicensesDataTableComponent
} from "@cloud-internal/namespace/components/NamespaceLicensesDataTableComponent";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {UsageService} from "@edition/usage/services/Usage.service";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {getLicensePeriod} from "@core/util/license";
import {UpgradeButtonComponent} from "@cloud-internal/license/components/UpgradeButtonComponent";
import {LicenseSummarySectionComponent} from "@ee-internal/license/components/LicenseSummarySectionComponent";
import {LicenseUsageSectionComponent} from "@ee-internal/license/components/LicenseUsageSectionComponent";

export const NamespaceLicensesView: React.FC = () => {

    const params = useParams()

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)
    const usageService = useService(UsageService)
    const usageStore = useStore(UsageService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const licenseCount = React.useMemo(
        () => namespaceService.getById(namespaceId)?.licenses?.nodes?.length ?? 0,
        [namespaceStore, namespaceId]
    )

    const {license, licenseStartDate, limits} = useUsageLicense()

    const {afterDate, beforeDate} = getLicensePeriod(licenseStartDate)

    const usage = React.useMemo(
        () => usageService.getNamespaceUsage(namespaceId, {afterDate, beforeDate}),
        [usageStore, namespaceId, afterDate, beforeDate]
    )

    return <TabContent value={"licenses"}>
        <Flex justify={"space-between"} align={"center"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Licenses</Text>
                <Badge color={"secondary"}>{licenseCount}</Badge>
            </Flex>
            <ButtonGroup>
                <Link href={"/licenses/add"}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconPlus size={13}/>
                    </Button>
                </Link>
                <Link href={"https://codezero.build/subscription"}>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <AuroraBackground/>
                        <IconShoppingCart size={13}/>
                    </Button>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Manage the licenses of this namespace. Your active license decides which workflow and AI entitlements
            everyone in this namespace can use.
        </Text>
        <Spacing spacing={"md"}/>
        <Text size={"md"} hierarchy={"secondary"}>Current plan</Text>
        <Spacing spacing={"lg"}/>
        <Card color={"secondary"}>
            <LicenseSummarySectionComponent license={license}
                                            fallbackName={"Free plan"}
                                            action={<UpgradeButtonComponent namespaceId={namespaceIndex}
                                                                            color={"tertiary"}
                                                                            paddingSize={"xxs"}/>}/>
            <LicenseUsageSectionComponent title={"Workflow usage"}
                                          unit={"workflow executions"}
                                          used={usage?.runtimeCount ?? 0}
                                          limit={limits.workflow}
                                          afterDate={afterDate}
                                          beforeDate={beforeDate}/>
            <LicenseUsageSectionComponent title={"AI usage"}
                                          unit={"AI tokens"}
                                          used={usage?.aiValue ?? 0}
                                          limit={limits.ai}
                                          afterDate={afterDate}
                                          beforeDate={beforeDate}/>
        </Card>
        <Spacing spacing={"lg"}/>
        <Text size={"md"} hierarchy={"secondary"}>All used or future licenses</Text>
        <Spacing spacing={"lg"}/>
        <NamespaceLicensesDataTableComponent namespaceId={namespaceId}/>
    </TabContent>
}
