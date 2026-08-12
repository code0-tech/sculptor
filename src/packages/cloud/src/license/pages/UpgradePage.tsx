"use client"

import React from "react";
import {useRouter} from "next/navigation";
import {UpgradeDialogComponent} from "@cloud-internal/license/components/UpgradeDialogComponent";

export const UpgradePage: React.FC = () => {

    const router = useRouter()

    return <UpgradeDialogComponent open={true}
                                   onOpenChange={(open) => {
                                       if (open) return

                                       const nav = (window as unknown as { navigation?: { entries(): { url: string }[], currentEntry?: { index: number } } }).navigation
                                       if (!nav?.entries) {
                                           router.back()
                                           return
                                       }

                                       const index = nav.currentEntry?.index ?? 0
                                       if (index > 0) router.back()
                                       else router.push("/")
                                   }}/>
}
