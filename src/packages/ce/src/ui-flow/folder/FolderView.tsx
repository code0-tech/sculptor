"use client"

import React from "react";
import {
    Button,
    DFlowFolder,
    DFlowFolderCreateDialog,
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
import {IconArrowsMaximize, IconArrowsMinimize, IconCircleDot, IconPlus} from "@tabler/icons-react";
import {useParams, useRouter} from "next/navigation";
import {Flow, FlowType, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/Flow.service";
import {
    DFlowFolderContextMenuGroupData,
    DFlowFolderContextMenuItemData
} from "@code0-tech/pictor/dist/components/d-flow-folder/DFlowFolderContextMenu";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";

export const FolderView: React.FC = () => {

    const router = useRouter()
    const params = useParams()
    const flowService = useService(FlowService)

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
    }, [flowService])

    return <>

        <DFlowFolderCreateDialog open={createDialogOpen}
                                 key={flowTypeId}
                                 onOpenChange={(open) => setCreateDialogOpen(open)}
                                 onCreate={createFlow}
                                 flowTypeId={flowTypeId}/>

        <DFlowFolderDeleteDialog open={deleteDialogOpen}
                                 onOpenChange={(open) => setDeleteDialogOpen(open)}
                                 contextData={contextData}
                                 onDelete={deleteFlow}/>

        <DLayout layoutGap={0} topContent={
            <Flex style={{gap: "0.35rem"}} align={"center"} justify={"space-between"} p={0.75}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={"filled"} paddingSize={"xxs"} onClick={() => {
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
                <ButtonGroup>
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