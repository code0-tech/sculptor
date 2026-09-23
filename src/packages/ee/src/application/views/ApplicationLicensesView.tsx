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
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import Link from "next/link";
import {IconPlus, IconShoppingCart} from "@tabler/icons-react";
import {ApplicationLicensesListComponent} from "@ee-internal/application/components/ApplicationLicensesListComponent";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {ApplicationService} from "@edition/application/services/Application.service";
import {UsageService} from "@edition/usage/services/Usage.service";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";
import {getLicensePeriod} from "@core/util/license";
import {LicenseSummarySectionComponent} from "@ee-internal/license/components/LicenseSummarySectionComponent";
import {LicenseUsageSectionComponent} from "@ee-internal/license/components/LicenseUsageSectionComponent";

export const ApplicationLicensesView: React.FC = () => {

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)
    const usageService = useService(UsageService)
    const usageStore = useStore(UsageService)

    const licenseCount = React.useMemo(
        () => applicationService.get()?.licenses?.nodes?.length ?? 0,
        [applicationStore]
    )

    const {license, licenseStartDate, limits, resolved} = useUsageLicense()

    const {afterDate, beforeDate} = getLicensePeriod(licenseStartDate)

    const usage = React.useMemo(
        () => resolved ? usageService.getApplicationUsage({afterDate, beforeDate}) : undefined,
        [usageStore, resolved, afterDate, beforeDate]
    )

    return <TabContent value={"license"}>
        <Flex justify={"space-between"} align={"center"}>
            <Flex align={"center"} style={{gap: "0.5rem"}}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Licenses</Text>
                <Badge color={"secondary"}>{licenseCount}</Badge>
            </Flex>
            <ButtonGroup>
                <Link href={"/licenses/add"}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={"none"} paddingSize={"xxs"}>
                                <IconPlus size={13}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent sideOffset={8} color={"secondary"}>
                                <Text size={"sm"}>
                                    Connect a license
                                </Text>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                </Link>
                <Link href={"https://codezero.build/subscription"}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={"none"} paddingSize={"xxs"}>
                                <AuroraBackground/>
                                <IconShoppingCart size={13}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent sideOffset={8} color={"secondary"}>
                                <Text size={"sm"}>
                                    Buy a subscription
                                </Text>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                </Link>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Manage the licenses of this instance. Your active license decides which features and which workflow and AI
            entitlements are unlocked.
        </Text>
        <Spacing spacing={"md"}/>
        <Text size={"md"} hierarchy={"secondary"}>Current plan</Text>
        <Spacing spacing={"lg"}/>
        <Card color={"secondary"}>
            <LicenseSummarySectionComponent license={license}
                                            fallbackName={"Enterprise Edition license"}
                                            action={<Link href={"/licenses/add"}>
                                                <Button color={"tertiary"} paddingSize={"xxs"}>
                                                    Connect a license
                                                </Button>
                                            </Link>}/>
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
        <ApplicationLicensesListComponent/>
    </TabContent>
}
