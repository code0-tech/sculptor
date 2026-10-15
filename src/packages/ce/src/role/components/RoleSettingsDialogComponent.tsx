"use client"

import React from "react";
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
                          tabs={[
                              {
                                  value: "general",
                                  label: "General",
                                  icon: IconSettings2,
                                  content: <RoleGeneralAdjustmentView/>
                              },
                              {
                                  value: "permission",
                                  label: "Permissions",
                                  icon: IconShieldLock,
                                  content: <RolePermissionView/>
                              },
                              {
                                  value: "project",
                                  label: "Limit to projects",
                                  icon: IconFolder,
                                  content: <RoleProjectView/>
                              },
                              {
                                  value: "delete",
                                  label: "Delete role",
                                  icon: IconTrash,
                                  content: <RoleDeleteView/>
                              }
                          ]}/>
}
