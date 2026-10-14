"use client"

import React from "react";
import {IconKey, IconServer, IconSettings2, IconShieldLock, IconUsers} from "@tabler/icons-react";
import {ApplicationUsersView} from "@edition/application/views/ApplicationUsersView";
import {ApplicationServersView} from "@edition/application/views/ApplicationServersView";
import {ApplicationGeneralSettingsView} from "@edition/application/views/ApplicationGeneralSettingsView";
import {ApplicationRestrictionsView} from "@edition/application/views/ApplicationRestrictionsView";
import {ApplicationIdentityProvidersView} from "@edition/application/views/ApplicationIdentityProvidersView";
import {ApplicationLicensesTab} from "@edition/application/views/ApplicationLicensesTabTriggerView";
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
                          tabs={[
                              {
                                  value: "general",
                                  label: "Settings",
                                  icon: IconSettings2,
                                  content: <ApplicationGeneralSettingsView/>
                              },
                              ApplicationLicensesTab,
                              {
                                  value: "users",
                                  label: "Users",
                                  icon: IconUsers,
                                  content: <ApplicationUsersView/>
                              },
                              {
                                  value: "servers",
                                  label: "Servers",
                                  icon: IconServer,
                                  content: <ApplicationServersView/>
                              },
                              {
                                  value: "restrictions",
                                  label: "Restrictions",
                                  icon: IconShieldLock,
                                  content: <ApplicationRestrictionsView/>
                              },
                              {
                                  value: "identityProviders",
                                  label: "Identity providers",
                                  icon: IconKey,
                                  content: <ApplicationIdentityProvidersView/>
                              }
                          ]}/>
}
