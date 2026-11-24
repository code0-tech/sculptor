"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.lastPage.util";
import {useRouter} from "next/navigation";
import {OrganizationCreateDialogComponent} from "@edition/organization/components/OrganizationCreateDialogComponent";

export const OrganizationCreatePage: React.FC = () => {

    const router = useRouter()

    return <OrganizationCreateDialogComponent open={true}
                                              onOpenChange={(open) => {
                                                  if (open) return
                                                  closeDialog(router, "/")
                                              }}/>
}
