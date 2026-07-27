"use client"

import React from "react";
import {Button, Text} from "@code0-tech/pictor";
import {TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
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
                          trigger={<TabList>
                              <TabTrigger value={"general"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconSettings2 size={13}/>
                                      <Text size={"md"}>General</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"servers"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconServer size={13}/>
                                      <Text size={"md"}>Assigned servers</Text>
                                  </Button>
                              </TabTrigger>
                              <TabTrigger value={"delete"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconTrash size={13}/>
                                      <Text size={"md"}>Delete project</Text>
                                  </Button>
                              </TabTrigger>
                          </TabList>}>
        <ProjectSettingsGeneralView/>
        <ProjectSettingsAssignedServersView/>
        <ProjectSettingsDeleteView/>
    </SettingDialog>
}
