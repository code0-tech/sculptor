"use client"

import React from "react";
import {License} from "@code0-tech/sagittarius-graphql-types";

export type LicenseUpgradeTarget = "checkout" | "subscription"

export type LicenseUpgradeAction = "license" | "upgrade" | "customer"

export interface LicenseUpgradeOptions {
    target?: LicenseUpgradeTarget
    action?: LicenseUpgradeAction
    license?: License | null
}

export interface LicenseUpgrade {
    available: boolean
    pending: boolean
    upgrade: () => void
}

export const useLicenseUpgrade = (reference: string, namespaceId?: string | number, options?: LicenseUpgradeOptions): LicenseUpgrade => {

    const upgrade = React.useCallback(() => {
    }, [])

    return {available: false, pending: false, upgrade}
}
