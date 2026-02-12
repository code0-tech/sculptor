"use client"

import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Button, Text, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger} from "@code0-tech/pictor";
import {IconBuilding, IconHome, IconSettings} from "@tabler/icons-react";
import React from "react";
import {useParams, usePathname, useRouter} from "next/navigation";
import {hashToColor} from "@code0-tech/pictor/dist/components/d-flow/DFlow.util";

export default function Page() {


    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()
    const defaultValue = pathname.includes("flow") ? "flow"
        : "settings"

    const namespaceId = params.namespaceId as any
    const projectId = params.projectId as any
    const flowId = params.flowId as any

    return <Tab defaultValue={defaultValue} orientation={"vertical"}>
        <TabList>
            <Tooltip>
                <TooltipTrigger asChild>
                    <TabTrigger value={"flow"} asChild={true}>
                        <Button variant={"none"} paddingSize={"xs"} onClick={() => {
                            if (!flowId) {
                                router.push(`/namespace/${namespaceId}/project/${projectId}/flow`)
                            } else {
                                router.push(`/namespace/${namespaceId}/project/${projectId}/flow/${flowId}`)
                            }
                        }}>
                            <IconHome size={16}/>
                        </Button>
                    </TabTrigger>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"right"} sideOffset={8} color={"primary"}>
                        <Text>Flow builder</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <TabTrigger value={"settings"} asChild={true}>
                        <Button variant={"none"} paddingSize={"xs"} onClick={() => router.push(`/namespace/${namespaceId}/project/${projectId}/settings`)}>
                            <IconSettings color={hashToColor("settings")} size={16}/>
                        </Button>
                    </TabTrigger>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"right"} sideOffset={8} color={"primary"}>
                        <Text>Settings</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </TabList>
    </Tab>
}