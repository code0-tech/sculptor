"use client"

import React from "react";
import {Badge, Flex, Text} from "@code0-tech/pictor";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {licenseCustomerTypeNames, licensePaymentPeriodNames} from "@core/util/license";

export interface LicenseBillingComponentProps {
    license?: License | null
}

export const LicenseBillingComponent: React.FC<LicenseBillingComponentProps> = (props) => {

    const {license} = props

    const paymentPeriod = license?.options?.paymentPeriod
    const customerType = license?.options?.customerType

    const details = [
        {label: "Billed", value: paymentPeriod ? (licensePaymentPeriodNames[paymentPeriod] ?? paymentPeriod) : undefined},
        {label: "Customer", value: customerType ? (licenseCustomerTypeNames[customerType] ?? customerType) : undefined}
    ].filter(detail => !!detail.value)

    if (details.length <= 0) return <Text hierarchy={"tertiary"}>
        No subscription details
    </Text>

    return <Flex style={{flexDirection: "column", gap: "0.35rem", textWrap: "nowrap"}}>
        {details.map(detail => (
            <Text key={detail.label} display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                {detail.label}
                <Badge color={"secondary"}>
                    <Text>
                        {detail.value}
                    </Text>
                </Badge>
            </Text>
        ))}
    </Flex>
}
