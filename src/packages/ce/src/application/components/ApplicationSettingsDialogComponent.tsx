"use client"

import React from "react";
import {Button, Text} from "@code0-tech/pictor";
import {TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconKey, IconServer, IconSettings2, IconShieldLock, IconUsers} from "@tabler/icons-react";
import {ApplicationUsersView} from "@edition/application/views/ApplicationUsersView";
import {ApplicationServersView} from "@edition/application/views/ApplicationServersView";
import {ApplicationGeneralSettingsView} from "@edition/application/views/ApplicationGeneralSettingsView";
import {ApplicationRestrictionsView} from "@edition/application/views/ApplicationRestrictionsView";
import {ApplicationIdentityProvidersView} from "@edition/application/views/ApplicationIdentityProvidersView";
import {ApplicationLicensesView} from "@edition/application/views/ApplicationLicensesView";
import {ApplicationLicensesTabTriggerView} from "@edition/application/views/ApplicationLicensesTabTriggerView";
import {SettingDialog} from "@core/components/SettingDialog";

export interface ApplicationSettingsDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const ApplicationSettingsDialogComponent: React.FC<ApplicationSettingsDialogComponentProps> = (props) => {

    const {open, onOpenChange} = props

    return <SettingDialog open={open} onOpenChange={(open) => onOpenChange?.(open)}
                          title={"Application settings"}
                          description={"General settings and restrictions for your Sculptor application. These settings affect all users and organizations."}
                          trigger={<TabList>
                              <TabTrigger value={"users"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconUsers size={13}/>
                                      <Text size={"md"}>Users</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"servers"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconServer size={13}/>
                                      <Text size={"md"}>Servers</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"general"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconSettings2 size={13}/>
                                      <Text size={"md"}>Settings</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"restrictions"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconShieldLock size={13}/>
                                      <Text size={"md"}>Restrictions</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"identityProviders"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconKey size={13}/>
                                      <Text size={"md"}>Identity providers</Text>
                                  </Button>
                              </TabTrigger>
                              <ApplicationLicensesTabTriggerView/>
                          </TabList>}>
        <ApplicationUsersView/>
        <ApplicationServersView/>
        <ApplicationGeneralSettingsView/>
        <ApplicationRestrictionsView/>
        <ApplicationIdentityProvidersView/>
        <ApplicationLicensesView/>
    </SettingDialog>
}
