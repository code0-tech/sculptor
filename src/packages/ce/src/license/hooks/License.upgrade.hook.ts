"use client"

import React from "react";

export interface LicenseUpgrade {
    available: boolean
    pending: boolean
    upgrade: () => void
}

export const useLicenseUpgrade = (reference: string, namespaceId?: string | number): LicenseUpgrade => {

    const upgrade = React.useCallback(() => {
    }, [])

    return {available: false, pending: false, upgrade}
}
