"use client"

import React from "react";
import {Button, Text} from "@code0-tech/pictor";
import {TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconFolder, IconSettings2, IconShieldLock, IconTrash} from "@tabler/icons-react";
import {RoleGeneralAdjustmentView} from "@edition/role/views/RoleGeneralAdjustmentView";
import {RolePermissionView} from "@edition/role/views/RolePermissionView";
import {RoleProjectView} from "@edition/role/views/RoleProjectView";
import {RoleDeleteView} from "@edition/role/views/RoleDeleteView";
import {SettingDialog} from "@core/components/SettingDialog";

export interface RoleSettingsDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const RoleSettingsDialogComponent: React.FC<RoleSettingsDialogComponentProps> = (props) => {

    const {open, onOpenChange} = props

    //TODO: limit tabs based on user abilities for roles

    return <SettingDialog open={open}
                          onOpenChange={(open) => onOpenChange?.(open)}
                          title={"Role settings"}
                          description={"General settings and permissions for this role. These settings affect every member the role is assigned to."}
                          trigger={<TabList>
                              <TabTrigger value={"general"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconSettings2 size={13}/>
                                      <Text size={"md"}>General</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"permission"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconShieldLock size={13}/>
                                      <Text size={"md"}>Permissions</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"project"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconFolder size={13}/>
                                      <Text size={"md"}>Limit to projects</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"delete"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconTrash size={13}/>
                                      <Text size={"md"}>Delete role</Text>
                                  </Button>
                              </TabTrigger>
                          </TabList>}>
        <RoleGeneralAdjustmentView/>
        <RolePermissionView/>
        <RoleProjectView/>
        <RoleDeleteView/>
    </SettingDialog>
}
