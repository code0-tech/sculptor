"use client"

import React from "react";
import {IconServer, IconSettings2, IconTrash} from "@tabler/icons-react";
import {SettingDialog} from "@core/components/SettingDialog";
import {ProjectSettingsGeneralView} from "@edition/project/views/ProjectSettingsGeneralView";
import {ProjectSettingsAssignedServersView} from "@edition/project/views/ProjectSettingsAssignedServersView";
import {ProjectSettingsDeleteView} from "@edition/project/views/ProjectSettingsDeleteView";

export interface ProjectSettingsDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const ProjectSettingsDialogComponent: React.FC<ProjectSettingsDialogComponentProps> = (props) => {

    const {open, onOpenChange} = props

    return <SettingDialog open={open}
                          onOpenChange={(open) => onOpenChange?.(open)}
                          title={"Project settings"}
                          description={"General settings, assigned servers and restrictions for this project. These settings affect everyone who has access to this project."}
                          tabs={[
                              {
                                  value: "general",
                                  label: "General",
                                  icon: IconSettings2,
                                  content: <ProjectSettingsGeneralView/>
                              },
                              {
                                  value: "servers",
                                  label: "Assigned servers",
                                  icon: IconServer,
                                  content: <ProjectSettingsAssignedServersView/>
                              },
                              {
                                  value: "delete",
                                  label: "Delete project",
                                  icon: IconTrash,
                                  content: <ProjectSettingsDeleteView/>
                              }
                          ]}/>
}
