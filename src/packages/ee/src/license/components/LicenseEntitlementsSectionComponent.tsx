"use client"

import React from "react";
import {Flex, getSize, Text} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {License} from "@code0-tech/sagittarius-graphql-types";

const numberFormat = new Intl.NumberFormat()

export interface LicenseEntitlementsSectionComponentProps {
    license?: License | null
}

export const LicenseEntitlementsSectionComponent: React.FC<LicenseEntitlementsSectionComponentProps> = (props) => {

    const {license} = props

    const entitlements = [
        {label: "Workflow executions", value: license?.restrictions?.workflowExecutions},
        {label: "AI tokens", value: license?.restrictions?.aiTokens}
    ]

    return <CardSection border>
        <Flex style={{gap: getSize("xxl"), flexWrap: "wrap"}}>
            {entitlements.map(entitlement => (
                <Flex key={entitlement.label} style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                    <Text size={"md"} hierarchy={"primary"}>
                        {entitlement.value == null ? "Unlimited"
                            : entitlement.value <= 0 ? "None included"
                                : `${numberFormat.format(entitlement.value)} / month`}
                    </Text>
                    <Text size={"md"} hierarchy={"tertiary"}>
                        {entitlement.label}
                    </Text>
                </Flex>
            ))}
        </Flex>
    </CardSection>
}
