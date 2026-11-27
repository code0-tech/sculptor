"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {usePathname, useRouter} from "next/navigation";
import {OrganizationCreateDialogComponent} from "@edition/organization/components/OrganizationCreateDialogComponent";

export const OrganizationCreatePage: React.FC = () => {

    const router = useRouter()
    const pathname = usePathname()

    return <OrganizationCreateDialogComponent open={pathname === "/workspaces/create"}
                                              onOpenChange={(open) => {
                                                  if (open) return
                                                  closeDialog(router, "/")
                                              }}/>
}
