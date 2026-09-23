"use client"

import React from "react";
import {Text} from "@code0-tech/pictor";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {formatDistanceToNow} from "date-fns";
import {licenseCustomerTypeNames, licensePaymentPeriodNames} from "@core/util/license";

export interface LicenseDetailsComponentProps {
    license?: License | null
}

export const LicenseDetailsComponent: React.FC<LicenseDetailsComponentProps> = (props) => {

    const {license} = props

    const paymentPeriod = license?.options?.paymentPeriod
    const customerType = license?.options?.customerType

    return <Text size={"md"} hierarchy={"tertiary"}>
        {license?.startDate ? <>
            Active since <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
            {formatDistanceToNow(license.startDate, {addSuffix: true})}
        </Text> and active until <Text size={"md"} hierarchy={"primary"} display={"inline"} style={{verticalAlign: "baseline"}}>
            {license.endDate ? formatDistanceToNow(license.endDate, {addSuffix: true}) : "further notice"}
        </Text>.
        </> : "Not started yet."}
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
}
