"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {notFound, useParams, useRouter} from "next/navigation";
import {Runtime} from "@code0-tech/sagittarius-graphql-types";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {RuntimeSettingsDialogComponent} from "@edition/runtime/components/RuntimeSettingsDialogComponent";

export const RuntimeSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const namespaceIndex = params.namespaceId as any as number
    const runtimeIndex = params.runtimeId as any as number

    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const runtimeId = `gid://sagittarius/Runtime/${runtimeIndex}` as Runtime['id']
    const runtime = React.useMemo(
        () => runtimeService.getById(runtimeId),
        [runtimeStore, runtimeId]
    )

    if (runtime?.userAbilities && (!runtime.userAbilities.updateRuntime || !runtime.userAbilities.deleteRuntime || !runtime.userAbilities.rotateRuntimeToken)) {
        notFound()
    }

    const runtimesHref = namespaceIndex ? `/namespace/${namespaceIndex}/runtimes` : "/runtimes"

    return <RuntimeSettingsDialogComponent runtimeId={runtimeId}
                                           namespaceId={namespaceIndex}
                                           open={true}
                                           onOpenChange={(open) => {
                                               if (open) return

                                               const nav = (window as unknown as { navigation?: { entries(): { url: string }[], currentEntry?: { index: number } } }).navigation
                                               if (!nav?.entries) {
                                                   router.back()
                                                   return
                                               }

                                               const index = nav.currentEntry?.index ?? 0
                                               if (index > 0) router.back()
                                               else router.push(runtimesHref)
                                           }}/>
}
