"use client"

import React from "react";
import {Button, Text, useService, useStore} from "@code0-tech/pictor";
import {TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconServer, IconSettings2, IconShieldLock, IconTrash, IconUsers} from "@tabler/icons-react";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {MembersView} from "@edition/member/views/MembersView";
import {RolesView} from "@edition/role/views/RolesView";
import {NamespaceServersView} from "@edition/namespace/views/NamespaceServersView";
import {NamespaceGeneralSettingsView} from "@edition/namespace/views/NamespaceGeneralSettingsView";
import {NamespaceDeleteView} from "@edition/namespace/views/NamespaceDeleteView";
import {NamespaceLicensesView} from "@edition/namespace/views/NamespaceLicensesView";
import {NamespaceLicensesTabTriggerView} from "@edition/namespace/views/NamespaceLicensesTabTriggerView";
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
                          trigger={<TabList>
                              <TabTrigger value={"members"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconUsers size={13}/>
                                      <Text size={"md"}>Members</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"roles"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconShieldLock size={13}/>
                                      <Text size={"md"}>Roles</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"servers"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconServer size={13}/>
                                      <Text size={"md"}>Servers</Text>
                                  </Button>
                              </TabTrigger>
                              {isOrganization && (
                                  <>
                                      <TabTrigger value={"general"} w={"100%"} asChild>
                                          <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                              <IconSettings2 size={13}/>
                                              <Text size={"md"}>General</Text>
                                          </Button>
                                      </TabTrigger>
                                      <TabTrigger value={"delete"} w={"100%"} asChild>
                                          <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                              <IconTrash size={13}/>
                                              <Text size={"md"}>Delete workspace</Text>
                                          </Button>
                                      </TabTrigger>
                                  </>
                              )}
                              <NamespaceLicensesTabTriggerView/>
                          </TabList>}>
        <TabContent value={"members"} style={{overflow: "hidden"}}>
            <MembersView/>
        </TabContent>
        <TabContent value={"roles"} style={{overflow: "hidden"}}>
            <RolesView/>
        </TabContent>
        <NamespaceServersView/>
        <TabContent value={"general"} style={{overflow: "hidden"}}>
            <NamespaceGeneralSettingsView/>
        </TabContent>
        <TabContent value={"delete"} style={{overflow: "hidden"}}>
            <NamespaceDeleteView/>
        </TabContent>
        <NamespaceLicensesView/>
    </SettingDialog>
}
