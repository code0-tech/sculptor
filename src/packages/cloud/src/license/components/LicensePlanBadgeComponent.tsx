"use client"

import React from "react";
import {Badge, Text} from "@code0-tech/pictor";
import BorderBeam, {BorderBeamColorVariant} from "border-beam";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {isLicenseActive} from "@core/util/license";

const planBeamVariants: Record<string, BorderBeamColorVariant> = {
    PRO: "mono",
    MAX: "sunset",
    CUSTOM: "ocean",
}

export interface LicensePlanBadgeComponentProps {
    license?: License | null
}

export const LicensePlanBadgeComponent: React.FC<LicensePlanBadgeComponentProps> = (props) => {

    const {license} = props

    const plan = isLicenseActive(license) ? license?.options?.plan ?? "CUSTOM" : undefined
    const beamVariant = plan ? planBeamVariants[plan] : undefined

    const badge = <Badge bg={"transparent"}>
        <Text c={"inherit"} size={"sm"} style={{fontWeight: plan ? "bold" : "unset"}}>
            {plan ?? "FREE"}
        </Text>
    </Badge>

    if (!beamVariant) return badge

    return <BorderBeam strength={1} colorVariant={beamVariant} size={"sm"} theme={"dark"} duration={5}
                       style={{display: "inline-block", flexShrink: 0}}>
        {badge}
    </BorderBeam>
}
