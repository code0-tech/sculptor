"use client"

import React from "react";
import {closeDialog} from "@core/util/Navigation.dialog.util";
import {useService, useStore} from "@code0-tech/pictor";
import {notFound, useParams, usePathname, useRouter} from "next/navigation";
import {Runtime} from "@code0-tech/sagittarius-graphql-types";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {RuntimeSettingsDialogComponent} from "@edition/runtime/components/RuntimeSettingsDialogComponent";

export const RuntimeSettingsPage: React.FC = () => {

    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()
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

    const runtimeHref = namespaceIndex ? `/namespace/${namespaceIndex}/runtimes/${runtimeIndex}/settings` : `/runtimes/${runtimeIndex}/settings`
    const runtimesHref = namespaceIndex ? `/namespace/${namespaceIndex}/settings?tab=servers` : "/settings?tab=servers"

    return <RuntimeSettingsDialogComponent runtimeId={runtimeId}
                                           namespaceId={namespaceIndex}
                                           open={pathname === runtimeHref}
                                           onOpenChange={(open) => {
                                               if (open) return
                                               closeDialog(router, runtimesHref)
                                           }}/>
}
