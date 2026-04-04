"use client"

import React from "react";
import {ResizableHandle, ResizablePanelGroup} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";
import {WorkerProvider} from "@edition/flow/components/FlowWorkerProvider";
import {redirect, useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";

interface FlowLayoutProps {
    children: React.ReactNode
}

export const FlowLayout: React.FC<FlowLayoutProps> = ({children}) => {

    const params = useParams()

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceIndex = params?.namespaceId as string
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex as unknown as number}`

    const namespace = React.useMemo(
        () => namespaceService.getById(namespaceId),
        [namespaceStore, namespaceIndex]
    )

    if (namespace && (!namespace.currentNamespaceLicense || namespace.currentNamespaceLicense?.endDate < new Date())) {
        redirect(`/namespace/${namespaceIndex}/settings`)
    }

    return <ResizablePanelGroup orientation={"horizontal"}>
        <SidebarComponent title={"Explorer"} id={"1"}>
            <FlowFolderView/>
        </SidebarComponent>
        <ResizableHandle/>
        <WorkerProvider>
            {children}
        </WorkerProvider>
    </ResizablePanelGroup>
}