"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {notFound} from "next/navigation";
import {Tab} from "@code0-tech/pictor/dist/components/tab/Tab";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";
import {ApplicationGeneralSettingsView} from "@edition/application/views/ApplicationGeneralSettingsView";
import {ApplicationRestrictionsView} from "@edition/application/views/ApplicationRestrictionsView";
import {ApplicationTabListView} from "@edition/application/views/ApplicationTabListView";
import {ApplicationLicensesView} from "@edition/application/views/ApplicationLicensesView";

export const ApplicationSettingsPage: React.FC = () => {

    const userStore = useStore(UserService)
    const userService = useService(UserService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    if (currentUser && !currentUser.admin) {
        notFound()
    }

    return <Tab orientation={"vertical"} defaultValue={"general"} h={"100%"}>
        <ResizablePanelGroup>
            <SidebarComponent id={"1"}
                              title={"Application settings"}
                              description={"General settings and restrictions for your Sculptor application. These settings affect all users and organizations within the application."}>
                <ApplicationTabListView/>
            </SidebarComponent>
            <ResizableHandle/>
            <ResizablePanel id={"2"} color={"primary"} p={2} style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                <>
                    <ApplicationGeneralSettingsView/>
                    <ApplicationRestrictionsView/>
                    <ApplicationLicensesView/>
                </>
            </ResizablePanel>
        </ResizablePanelGroup>
    </Tab>
}