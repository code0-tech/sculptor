"use client"

import React from "react";
import {lastPageUrl} from "@core/util/Navigation.lastPage.util";
import {useRouter} from "next/navigation";
import {UpgradeDialogComponent} from "@cloud-internal/license/components/UpgradeDialogComponent";

export const UpgradePage: React.FC = () => {

    const router = useRouter()

    return <UpgradeDialogComponent open={true}
                                   onOpenChange={(open) => {
                                       if (open) return
                                       router.replace(lastPageUrl() ?? "/")
                                   }}/>
}
