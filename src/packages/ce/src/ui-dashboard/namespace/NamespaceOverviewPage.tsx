"use client"

import React from "react";
import {NamespaceProjectsView} from "@edition/ui-dashboard/namespace/NamespaceProjectsView";
import {DLayout, useService, useStore, useUserSession} from "@code0-tech/pictor";
import {NamespaceOverviewRightView} from "@edition/ui-dashboard/namespace/NamespaceOverviewRightView";
import {NamespaceOverviewLeftView} from "@edition/ui-dashboard/namespace/NamespaceOverviewLeftView";
import {useParams} from "next/navigation";
import {UserService} from "@edition/user/User.service";

export const NamespaceOverviewPage: React.FC = () => {

    const params = useParams()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentSession = useUserSession()

    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])
    const namespaceIndexCurrentUser = currentUser?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
    const namespaceId = params.namespaceId as any as string

    return <DLayout showLayoutSplitter={false} layoutGap={"0"}
                    leftContent={namespaceIndexCurrentUser == namespaceId ? <NamespaceOverviewLeftView/> : undefined}
                    rightContent={<NamespaceOverviewRightView/>}>
        <div style={{
            background: "#070514",
            height: "100%",
            padding: "1rem",
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem"
        }}>
            <NamespaceProjectsView/>
        </div>
    </DLayout>
}