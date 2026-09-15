import React from "react";
import {Panel} from "@xyflow/react";
import {
    Badge,
    Button,
    Flex,
    getSize,
    Text,
    Tooltip,
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {IconCloudCheck, IconCloudUpload} from "@tabler/icons-react";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {formatDistanceToNow} from "date-fns";


export const FlowPanelLayoutComponent: React.FC = () => {

    const params = useParams()
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const [loading, startTransition] = React.useTransition()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const flow = React.useMemo(
        () => flowService.getById(flowId, {
            namespaceId,
            projectId
        }),
        [flowId, flowStore, namespaceId, projectId]
    )

    const edited = React.useMemo(
        () => !!flow?.editedAt && new Date(flow?.updatedAt ?? Date.now()).getTime() != new Date(flow?.editedAt ?? Date.now()).getTime(),
        [flow, flowStore]
    )
    const lastSave = React.useMemo(() => formatDistanceToNow(new Date(flow?.updatedAt ?? Date.now()), {addSuffix: true}), [flow, flowStore])

    React.useEffect(() => {
        if (!edited) return

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
        }

        window.addEventListener("beforeunload", onBeforeUnload)
        return () => window.removeEventListener("beforeunload", onBeforeUnload)
    }, [edited])

    const flowUpdate = () => {
        const flowInput = flowService.getPayloadById(flowId)
        if (!flowInput) return

        startTransition(async () => {
            const payload = await flowService.flowUpdate({flowInput, flowId})
            if ((payload?.errors?.length ?? 0) <= 0) toast({title: "Synced flow", color: "success"})
        })
    }

    return <Panel position={"top-center"}>
        <Flex align={"center"} style={{gap: getSize("xxs")}}>
            <Text style={{textWrap: "nowrap"}}>{flow?.name}</Text>
            <Tooltip>
                <TooltipTrigger asChild>
                    {
                        edited ? (
                            <Button onClick={flowUpdate}
                                    disabled={loading}
                                    paddingSize={"xxs"}
                                    color={"warning"}>
                                <Flex align={"center"} style={{textWrap: "nowrap", gap: getSize("xxs")}}>
                                    <IconCloudUpload size={13}/>
                                    <Text>{loading ? "Saving..." : "Unsaved. Save now"}</Text>
                                </Flex>
                            </Button>
                        ) : (
                            <Badge color={"success"} border>
                                <Flex align={"center"} style={{textWrap: "nowrap", gap: getSize("xxs")}}>
                                    <IconCloudCheck size={13}/>
                                    <Text c={"inherit"}>Synced</Text>
                                </Flex>
                            </Badge>
                        )
                    }
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"bottom"} maw={"200px"}>
                        <TooltipArrow/>
                        {edited ? (
                            <Text>Changes are also saved automatically within 1 minute</Text>
                        ) : (
                            <Text>Last save <Badge border color={"secondary"}>{lastSave}</Badge>.<br/> Everything is
                                synced.</Text>
                        )}
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </Flex>
    </Panel>
}
