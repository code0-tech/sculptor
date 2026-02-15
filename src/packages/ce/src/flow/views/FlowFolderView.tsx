"use client"

import React from "react";
import {
    Button,
    DFlowFolder,
    DFlowFolderDeleteDialog,
    DFlowFolderHandle,
    DLayout,
    Flex,
    Text,
    toast,
    Tooltip,
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService
} from "@code0-tech/pictor";
import {IconArrowsMaximize, IconArrowsMinimize, IconCircleDot, IconLayoutSidebar, IconPlus} from "@tabler/icons-react";
import {useParams, useRouter} from "next/navigation";
import {Flow, FlowType} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {
    DFlowFolderContextMenuGroupData,
    DFlowFolderContextMenuItemData
} from "@code0-tech/pictor/dist/components/d-flow-folder/DFlowFolderContextMenu";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {FlowCreateDialogComponent} from "@edition/flow/components/FlowCreateDialogComponent";

export const FlowFolderView: React.FC = () => {

    const router = useRouter()
    const params = useParams()
    const flowService = useService(FlowService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`

    const [, startTransition] = React.useTransition()
    const ref = React.useRef<DFlowFolderHandle>(null)

    const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
    const [flowTypeId, setFlowTypeId] = React.useState<FlowType['id']>(undefined)

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [contextData, setContextData] = React.useState<DFlowFolderContextMenuGroupData | DFlowFolderContextMenuItemData>({
        flow: [],
        name: "",
        type: "folder"
    })

    const deleteFlow = React.useCallback((flow: Flow) => {
        if (!flow?.id) return
        startTransition(() => {
            flowService.flowDelete({
                flowId: flow.id!
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({
                        title: "The flow was successfully deleted.",
                        color: "success",
                        dismissible: true,
                    })
                    router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/`)
                }
            })
        })
    }, [])

    return <>

        <FlowCreateDialogComponent open={createDialogOpen}
                                   onOpenChange={(open) => setCreateDialogOpen(open)}
                                   flowTypeId={flowTypeId}/>

        <DFlowFolderDeleteDialog open={deleteDialogOpen}
                                 onOpenChange={(open) => setDeleteDialogOpen(open)}
                                 contextData={contextData}
                                 onDelete={deleteFlow}/>

        <DLayout layoutGap={"0.7rem"} showLayoutSplitter={false} topContent={
            <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                <Flex style={{gap: "0.7rem"}} align={"center"} justify={"space-between"}>
                    <Text size={"md"} hierarchy={"secondary"}>Explorer</Text>
                    <Button variant={"none"} paddingSize={"xxs"}>
                        <IconLayoutSidebar size={16}/>
                    </Button>
                </Flex>
                <Flex style={{gap: "0.35rem"}} align={"center"} justify={"space-between"}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button color={"tertiary"} paddingSize={"xxs"} onClick={() => {
                                setCreateDialogOpen(true)
                                setFlowTypeId(undefined)
                            }}>
                                <IconPlus size={13}/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipPortal>
                            <TooltipContent side={"bottom"}>
                                <Text>Add new flow</Text>
                                <TooltipArrow/>
                            </TooltipContent>
                        </TooltipPortal>
                    </Tooltip>
                    <ButtonGroup color={"secondary"} style={{boxShadow: "none"}} p={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={"none"} paddingSize={"xxs"}
                                        onClick={() => ref.current?.openActivePath()}>
                                    <IconCircleDot size={13}/>
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
                                    <IconArrowsMinimize size={13}/>
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
                                    <IconArrowsMaximize size={13}/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipPortal>
                                <TooltipContent side={"bottom"}>
                                    <Text>Open all</Text>
                                    <TooltipArrow/>
                                </TooltipContent>
                            </TooltipPortal>
                        </Tooltip>
                    </ButtonGroup>
                </Flex>
            </Flex>
        }>
            <DFlowFolder ref={ref} activeFlowId={flowId}
                         onSelect={(flow) => {
                             const number = flow.id?.match(/Flow\/(\d+)$/)?.[1]
                             router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/flow/${number}`)
                         }}
                         onCreate={flowTypeId => {
                             setCreateDialogOpen(true)
                             setFlowTypeId(flowTypeId)
                         }}
                         onDelete={contextData => {
                             setDeleteDialogOpen(true)
                             setContextData(contextData)
                         }}
                         namespaceId={`gid://sagittarius/Namespace/${namespaceIndex}`}
                         projectId={`gid://sagittarius/NamespaceProject/${projectIndex}`}/>
        </DLayout>
    </>
}