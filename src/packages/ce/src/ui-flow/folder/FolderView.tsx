"use client"

import React from "react";
import {
    Button,
    DFlowFolder,
    DFlowFolderCreateDialog,
    DFlowFolderHandle,
    DLayout,
    Flex,
    Text, toast,
    Tooltip,
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger, useService, useStore
} from "@code0-tech/pictor";
import {IconArrowsMaximize, IconArrowsMinimize, IconCircleDot} from "@tabler/icons-react";
import {useParams, useRouter} from "next/navigation";
import {Flow, FlowType, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/Flow.service";

export const FolderView: React.FC = () => {

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const router = useRouter()
    const params = useParams()

    const [, startTransition] = React.useTransition()
    const ref = React.useRef<DFlowFolderHandle>(null)
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
    const [flowTypeId, setFlowTypeId] = React.useState<FlowType['id']>(undefined)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const createFlow = React.useCallback((name: string, type: FlowType['id']) => {
        if (!type) return
        startTransition(() => {
            flowService.flowCreate({
                // @ts-ignore
                flow: {
                    settings: [],
                    name: name,
                    type: type,
                    nodes: [],
                },
                projectId: projectId
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({
                        title: "The flow was successfully created.",
                        color: "success",
                        dismissible: true,
                    })
                }
            })
        })
    }, [flowService])

    return <>

        <DFlowFolderCreateDialog open={createDialogOpen}
                                 onOpenChange={(open) => setCreateDialogOpen(open)}
                                 onCreate={createFlow}
                                 flowTypeId={flowTypeId}/>

        <DLayout layoutGap={0} topContent={
            <Flex style={{gap: "0.35rem"}} align={"center"} justify={"space-between"} p={0.75}>
                <Button disabled paddingSize={"xxs"} color={"success"}>
                    <Text>Create new flow</Text>
                </Button>
                <Flex style={{gap: "0.35rem"}}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={"none"} paddingSize={"xxs"}
                                    onClick={() => ref.current?.openActivePath()}>
                                <IconCircleDot size={16}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent side={"bottom"}>
                                <Text>Open active flow</Text>
                                <TooltipArrow/>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={"none"} paddingSize={"xxs"}
                                    onClick={() => ref.current?.closeAll()}>
                                <IconArrowsMinimize size={16}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent side={"bottom"}>
                                <Text>Close all</Text>
                                <TooltipArrow/>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button paddingSize={"xxs"} variant={"none"}
                                    onClick={() => ref.current?.openAll()}>
                                <IconArrowsMaximize size={16}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent side={"bottom"}>
                                <Text>Open all</Text>
                                <TooltipArrow/>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                </Flex>
            </Flex>
        }>
            <div style={{padding: "0.75rem"}}>
                <DFlowFolder ref={ref} activeFlowId={flowId}
                             onSelect={(flow) => {
                                 const number = flow.id?.match(/Flow\/(\d+)$/)?.[1]
                                 router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/flow/${number}`)
                             }}
                             onCreate={flowTypeId => {
                                 setCreateDialogOpen(true)
                                 setFlowTypeId(flowTypeId)
                             }}
                             namespaceId={`gid://sagittarius/Namespace/${namespaceIndex}`}
                             projectId={`gid://sagittarius/NamespaceProject/${projectIndex}`}/>
            </div>
        </DLayout>
    </>
}