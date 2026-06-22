import React from "react";
import {useParams, usePathname, useRouter} from "next/navigation";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {Button, Text, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger} from "@code0-tech/pictor";
import {IconBox, IconHome, IconServer, IconSettings} from "@tabler/icons-react";

export const ProjectTabView: React.FC = () => {
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()
    const defaultValue = pathname.includes("flow") ? "flow"
        : pathname.includes("module") ? "module"
            : pathname.includes("runtime") ? "runtime" :
                "settings"

    const namespaceId = params.namespaceId as any
    const projectId = params.projectId as any
    const flowId = params.flowId as any

    return <Tab defaultValue={defaultValue} orientation={"vertical"}>
        <TabList>
            <Tooltip>
                <TooltipTrigger asChild>
                    <TabTrigger value={"flow"} asChild={true}>
                        <Button variant={"none"} paddingSize={"xs"} onClick={() => {
                            router.push(`/namespace/${namespaceId}/project/${projectId}/flow`)
                        }}>
                            <IconHome size={16}/>
                        </Button>
                    </TabTrigger>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"right"} sideOffset={8} color={"primary"}>
                        <Text>Flows</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <TabTrigger value={"runtime"} asChild={true}>
                        <Button variant={"none"} paddingSize={"xs"}
                                onClick={() => router.push(`/namespace/${namespaceId}/project/${projectId}/runtime`)}>
                            <IconServer size={16}/>
                        </Button>
                    </TabTrigger>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"right"} sideOffset={8} color={"primary"}>
                        <Text>Assigned runtimes</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <TabTrigger value={"module"} asChild={true}>
                        <Button variant={"none"} paddingSize={"xs"}
                                onClick={() => router.push(`/namespace/${namespaceId}/project/${projectId}/module`)}>
                            <IconBox size={16}/>
                        </Button>
                    </TabTrigger>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"right"} sideOffset={8} color={"primary"}>
                        <Text>Plugins</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <TabTrigger value={"settings"} asChild={true}>
                        <Button variant={"none"} paddingSize={"xs"}
                                onClick={() => router.push(`/namespace/${namespaceId}/project/${projectId}/settings`)}>
                            <IconSettings size={16}/>
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