"use client"

import React from "react";
import {Button} from "@code0-tech/pictor";
import Link from "next/link";
import BorderBeam from "border-beam";
import {useUsageOverview} from "@edition/usage/hooks/Usage.overview.hook";

export interface UpgradeButtonComponentProps {
    namespaceId?: string | number
    fullWidth?: boolean
    paddingSize?: React.ComponentProps<typeof Button>["paddingSize"]
    color?: React.ComponentProps<typeof Button>["color"]
    beamSize?: React.ComponentProps<typeof BorderBeam>["size"]
}

export const UpgradeButtonComponent: React.FC<UpgradeButtonComponentProps> = ({fullWidth, paddingSize, color = "tertiary", beamSize = "sm"}) => {

    const {licensed, atRisk} = useUsageOverview()

    const display = fullWidth ? "block" : "inline-block"

    return <Link href={"https://codezero.build/subscription"} target={"_blank"} style={{display}}>
        <BorderBeam strength={1} size={beamSize} theme={"dark"} duration={5} style={{display}}>
            <Button paddingSize={paddingSize} color={color} justify={"center"} w={fullWidth ? "100%" : undefined}>
                {licensed && atRisk.length > 0 ? "Increase your limits" : "Upgrade your license"}
            </Button>
        </BorderBeam>
    </Link>
}
