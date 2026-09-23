"use client"

import React from "react";
import {Button} from "@code0-tech/pictor";
import Link from "next/link";
import BorderBeam from "border-beam";

export interface UpgradeButtonComponentProps {
    children?: React.ReactNode
    namespaceId?: string | number
    fullWidth?: boolean
    paddingSize?: React.ComponentProps<typeof Button>["paddingSize"]
    color?: React.ComponentProps<typeof Button>["color"]
    beamSize?: React.ComponentProps<typeof BorderBeam>["size"]
}

export const UpgradeButtonComponent: React.FC<UpgradeButtonComponentProps> = ({children, fullWidth, paddingSize, color = "tertiary", beamSize = "sm"}) => {

    const display = fullWidth ? "block" : "inline-block"

    return <Link href={"https://codezero.build/subscription"} target={"_blank"} style={{display}}>
        <BorderBeam strength={1} size={beamSize} theme={"dark"} duration={5} style={{display}}>
            <Button paddingSize={paddingSize} color={color} justify={"center"} w={fullWidth ? "100%" : undefined}>
                {children ?? "Upgrade your plan"}
            </Button>
        </BorderBeam>
    </Link>
}
