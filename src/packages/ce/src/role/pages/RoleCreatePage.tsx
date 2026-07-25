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

                                          const nav = (window as unknown as { navigation?: { entries(): { url: string }[], currentEntry?: { index: number } } }).navigation
                                          if (!nav?.entries) {
                                              router.back()
                                              return
                                          }

                                          const index = nav.currentEntry?.index ?? 0
                                          if (index > 0) router.back()
                                          else router.push(settingsHref)
                                      }}/>
}
