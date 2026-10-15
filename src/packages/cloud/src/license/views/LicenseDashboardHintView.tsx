"use client"

import React from "react";
import {Button, Card, Flex, getSize, Text} from "@code0-tech/pictor";
import {IconChevronDown, IconInfoCircle} from "@tabler/icons-react";
import {LicenseMenuComponent} from "@cloud-internal/license/components/LicenseMenuComponent";
import {useUsageLicense} from "@edition/usage/hooks/Usage.license.hook";

export const LicenseDashboardHintView: React.FC = () => {

    const {license} = useUsageLicense()

    return <Card color={"secondary"} variant={"outlined"} paddingSize={"md"}
                 style={{border: "1px solid rgba(191, 191, 191, 0.1)", boxShadow: "none"}}>
        <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
            <Flex align={"center"} style={{gap: getSize("md")}}>
                <IconInfoCircle size={16} style={{minWidth: "16px", minHeight: "16px"}}/>
                <Text size={"md"} hierarchy={"tertiary"}>
                    This tab only shows which subscriptions are linked to this workspace. Every subscription is owned
                    by your customer profile in the subscription dashboard. Plan changes, billing and cancellation all
                    happen there.
                </Text>
            </Flex>
            {license ? <LicenseMenuComponent license={license}
                                             trigger={<Button color={"tertiary"} style={{flexShrink: 0}}>
                                                 <Text style={{textWrap: "nowrap"}}>
                                                     Manage subscription
                                                 </Text>
                                                 <IconChevronDown size={13}/>
                                             </Button>}/> : null}
        </Flex>
    </Card>
}
