"use client"

import React from "react";
import {ProjectsView} from "@edition/project/views/ProjectsView";
import {DLayout, useService, useStore, useUserSession, ScrollArea, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "@code0-tech/pictor";
import {NamespaceOverviewPersonalLeftView} from "@edition/namespace/views/NamespaceOverviewPersonalLeftView";
import {useParams} from "next/navigation";
import {UserService} from "@edition/user/services/User.service";
import {NamespaceOverviewOrganizationLeftView} from "@edition/namespace/views/NamespaceOverviewOrganizationLeftView";

export const NamespaceOverviewPage: React.FC = () => {

    const params = useParams()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentSession = useUserSession()

    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])
    const namespaceIndexCurrentUser = currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
    const namespaceId = params.namespaceId as any as string

    return <DLayout showLayoutSplitter={false} layoutGap={"0"}
                    leftContent={namespaceIndexCurrentUser == namespaceId ? <NamespaceOverviewPersonalLeftView/> :
                        <NamespaceOverviewOrganizationLeftView/>}>
        <div style={{
            background: "#070514",
            height: "100%",
            padding: "1rem",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem"
        }}>
            <ScrollArea h={"100%"} type={"scroll"}>
                <ScrollAreaViewport>
                    <ProjectsView/>
                </ScrollAreaViewport>
                <ScrollAreaScrollbar orientation={"vertical"}>
                    <ScrollAreaThumb/>
                </ScrollAreaScrollbar>
            </ScrollArea>
        </div>
    </DLayout>
}