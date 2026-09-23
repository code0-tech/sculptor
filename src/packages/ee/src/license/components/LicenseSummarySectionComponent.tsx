"use client"

import React from "react";
import {Badge, Flex, getSize, Text} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {formatDistanceToNow} from "date-fns";
import {
    getLicenseName,
    isLicenseActive,
    licenseCustomerTypeNames,
    licensePaymentPeriodNames
} from "@core/util/license";

export interface LicenseSummarySectionComponentProps {
    license?: License | null
    fallbackName: string
    action: React.ReactNode
}

export const LicenseSummarySectionComponent: React.FC<LicenseSummarySectionComponentProps> = (props) => {

    const {license, fallbackName, action} = props

    const active = isLicenseActive(license)
    const paymentPeriod = license?.options?.paymentPeriod
    const customerType = license?.options?.customerType

    return <CardSection border>
        <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
            <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                <Text size={"md"} hierarchy={"primary"}>
                    {getLicenseName(license, fallbackName)}
                </Text>
                <Text size={"md"} hierarchy={"tertiary"}>
                    {license?.startDate ? <>
                        Active since <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {formatDistanceToNow(license.startDate, {addSuffix: true})}
                    </Text> and active until <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {license.endDate ? formatDistanceToNow(license.endDate, {addSuffix: true}) : "further notice"}
                    </Text>.
                    </> : "No license connected yet."}
                    {paymentPeriod ? <>
                        {" "}Billed <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {(licensePaymentPeriodNames[paymentPeriod] ?? paymentPeriod).toLowerCase()}
                    </Text>{customerType ? <> as a <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {(licenseCustomerTypeNames[customerType] ?? customerType).toLowerCase()}
                    </Text> customer</> : null}.
                    </> : customerType ? <>
                        {" "}Registered as a <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                        {(licenseCustomerTypeNames[customerType] ?? customerType).toLowerCase()}
                    </Text> customer.
                    </> : null}
                </Text>
            </Flex>
            {active ? <Badge color={"success"}>
                <Text c={"inherit"}>
                    Active
                </Text>
            </Badge> : action}
        </Flex>
    </CardSection>
}
