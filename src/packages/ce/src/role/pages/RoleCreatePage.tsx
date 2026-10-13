"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {RoleCreateDialogComponent} from "@edition/role/components/RoleCreateDialogComponent";

export const RoleCreatePage: React.FC = () => {

    const params = useParams()
    const router = useRouter()

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const settingsHref = `/namespace/${namespaceIndex}/settings`

    return <RoleCreateDialogComponent open={true}
                                      namespaceId={namespaceId}
                                      onOpenChange={(open) => {
                                          if (open) return
                                          router.replace(`${settingsHref}?tab=roles`)
                                      }}/>
}
