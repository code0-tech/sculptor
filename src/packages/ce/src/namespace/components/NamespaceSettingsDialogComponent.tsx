"use client"

import React from "react";
import {useService, useStore} from "@code0-tech/pictor";
import {IconServer, IconSettings2, IconShieldLock, IconTrash, IconUsers} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {MembersView} from "@edition/member/views/MembersView";
import {RolesView} from "@edition/role/views/RolesView";
import {NamespaceServersView} from "@edition/namespace/views/NamespaceServersView";
import {NamespaceGeneralSettingsView} from "@edition/namespace/views/NamespaceGeneralSettingsView";
import {NamespaceDeleteView} from "@edition/namespace/views/NamespaceDeleteView";
import {NamespaceLicensesTab} from "@edition/namespace/views/NamespaceLicensesTabTriggerView";
import {SettingDialog} from "@core/components/SettingDialog";

export interface NamespaceSettingsDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const NamespaceSettingsDialogComponent: React.FC<NamespaceSettingsDialogComponentProps> = (props) => {

    const {open, onOpenChange} = props

    const params = useParams()
    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    const namespace = React.useMemo(
        () => namespaceService.getById(namespaceId),
        [namespaceStore, namespaceId]
    )

    const isOrganization = namespace?.parent?.__typename === "Organization"

    //TODO: add ability check for organization settings access for every settings tab

    return <SettingDialog open={open}
                          onOpenChange={(open) => onOpenChange?.(open)}
                          title={"Workspace settings"}
                          description={"Members, roles and general settings for your workspace. These settings affect everyone who has access to this workspace."}
                          tabs={[
                              {
                                  value: "members",
                                  label: "Members",
                                  icon: IconUsers,
                                  content: <MembersView/>
                              },
                              {
                                  value: "roles",
                                  label: "Roles",
                                  icon: IconShieldLock,
                                  content: <RolesView/>
                              },
                              {
                                  value: "servers",
                                  label: "Servers",
                                  icon: IconServer,
                                  content: <NamespaceServersView/>
                              },
                              isOrganization ? {
                                  value: "general",
                                  label: "General",
                                  icon: IconSettings2,
                                  content: <NamespaceGeneralSettingsView/>
                              } : undefined,
                              isOrganization ? {
                                  value: "delete",
                                  label: "Delete workspace",
                                  icon: IconTrash,
                                  content: <NamespaceDeleteView/>
                              } : undefined,
                              NamespaceLicensesTab
                          ]}/>
}
