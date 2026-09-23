"use client"

import React from "react";
import {Button} from "@code0-tech/pictor";

export interface UpgradeButtonComponentProps {
    namespaceId?: string | number
    fullWidth?: boolean
    paddingSize?: React.ComponentProps<typeof Button>["paddingSize"]
    color?: React.ComponentProps<typeof Button>["color"]
}

export const UpgradeButtonComponent: React.FC<UpgradeButtonComponentProps> = () => null
