"use client"

import React from "react";
import {Button} from "@code0-tech/pictor";

export interface UpgradeButtonComponentProps {
    reference: string
    namespaceId?: string | number
    fullWidth?: boolean
    color?: React.ComponentProps<typeof Button>["color"]
}

export const UpgradeButtonComponent: React.FC<UpgradeButtonComponentProps> = () => null
