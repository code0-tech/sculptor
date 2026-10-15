"use client"

import React from "react";
import {Badge, Card, Flex, getSize, Text} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {getLicenseName} from "@core/util/license";
import {LicenseDetailsComponent} from "@ee-internal/license/components/LicenseDetailsComponent";
import {
    LicenseEntitlementsSectionComponent
} from "@ee-internal/license/components/LicenseEntitlementsSectionComponent";

export interface LicenseCardComponentProps {
    license?: License | null
    fallbackName: string
    active: boolean
    actions: React.ReactNode
}

export const LicenseCardComponent: React.FC<LicenseCardComponentProps> = (props) => {

    const {license, fallbackName, active, actions} = props

    return <Card color={"secondary"} variant={"outlined"}
                 style={{border: "1px solid rgba(191, 191, 191, 0.1)", boxShadow: "none"}}>
        <CardSection border>
            <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
                <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                    <Flex align={"center"} style={{gap: getSize("xs")}}>
                        <Text size={"md"} hierarchy={"primary"}>
                            {getLicenseName(license, fallbackName)}
                        </Text>
                        {active ? <Badge color={"success"}>
                            <Text c={"inherit"}>
                                Active
                            </Text>
                        </Badge> : <Badge>
                            <Text>
                                Not active
                            </Text>
                        </Badge>}
                    </Flex>
                    <LicenseDetailsComponent license={license}/>
                </Flex>
                <Flex align={"center"} style={{flexShrink: 0}}>
                    {actions}
                </Flex>
            </Flex>
        </CardSection>
        <LicenseEntitlementsSectionComponent license={license}/>
    </Card>
}
