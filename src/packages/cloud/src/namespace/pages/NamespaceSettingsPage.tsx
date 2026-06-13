"use client"

import React from "react";
import {Tab, TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {NamespaceDeleteView} from "@edition/namespace/views/NamespaceDeleteView";
import {NamespaceGeneralSettingsView} from "@edition/namespace/views/NamespaceGeneralSettingsView";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {SidebarComponent} from "@core/components/SidebarComponent";
import {NamespaceTabListView} from "@edition/namespace/views/NamespaceTabListView";
import {useParams} from "next/navigation";
import {useService, useStore} from "@code0-tech/pictor";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceLicensesView} from "@cloud-internal/namespace/views/NamespaceLicensesView";

export const NamespaceSettingsPage: React.FC = () => {

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(
        () => namespaceService.getById(namespaceId),
        [namespaceStore, namespaceId]
    )

    //TODO: add ability check for organization settings access for every settings tab

    return <Tab orientation={"vertical"} defaultValue={namespace?.parent?.__typename === "Organization" ? "general" : "licenses"} h={"100%"}>
        <ResizablePanelGroup>
            <SidebarComponent id={"1"}
                              title={"Organization settings"}
                              description={"General settings and restrictions for your Sculptor application. These settings affect all users and organizations within the application."}>
                <NamespaceTabListView/>
            </SidebarComponent>
            <ResizableHandle/>
            <ResizablePanel id={"2"} color={"primary"} p={2}
                            style={{borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem"}}>
                <>
                    <TabContent value={"general"}>
                        <NamespaceGeneralSettingsView/>
                    </TabContent>
                    <TabContent value={"delete"}>
                        <NamespaceDeleteView/>
                    </TabContent>
                    <TabContent value={"licenses"}>
                        <NamespaceLicensesView/>
                    </TabContent>
                </>
            </ResizablePanel>
        </ResizablePanelGroup>
    </Tab>
}