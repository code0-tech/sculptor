"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {usePathname, useRouter} from "next/navigation";
import {UpgradeDialogComponent} from "@cloud-internal/license/components/UpgradeDialogComponent";

export const UpgradePage: React.FC = () => {

    const router = useRouter()
    const pathname = usePathname()

    return <UpgradeDialogComponent open={pathname === "/upgrade"}
                                   onOpenChange={(open) => {
                                       if (open) return
                                       closeDialog(router, "/")
                                   }}/>
}
