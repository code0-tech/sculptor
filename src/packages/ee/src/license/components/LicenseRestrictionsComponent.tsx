"use client"

import React from "react";
import {Badge, Flex, Text} from "@code0-tech/pictor";
import {License} from "@code0-tech/sagittarius-graphql-types";

const numberFormat = new Intl.NumberFormat()

export interface LicenseRestrictionsComponentProps {
    license?: License | null
}

export const LicenseRestrictionsComponent: React.FC<LicenseRestrictionsComponentProps> = (props) => {

    const {license} = props

    const entitlements = [
        {label: "Workflow executions", value: license?.restrictions?.workflowExecutions},
        {label: "AI tokens", value: license?.restrictions?.aiTokens}
    ]

    return <Flex style={{flexDirection: "column", gap: "0.35rem", textWrap: "nowrap"}}>
        {entitlements.map(entitlement => (
            <Text key={entitlement.label} display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                {entitlement.label}
                <Badge color={"secondary"}>
                    <Text>
                        {entitlement.value != null ? `${numberFormat.format(entitlement.value)} / month` : "Unlimited"}
                    </Text>
                </Badge>
            </Text>
        ))}
    </Flex>
}
