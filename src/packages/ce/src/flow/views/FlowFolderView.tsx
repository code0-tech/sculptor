"use client"

import React from "react";
import {
    Button,
    Flex,
    Spacing,
    Text,
    Tooltip,
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService
} from "@code0-tech/pictor";
import {IconArrowsMaximize, IconArrowsMinimize, IconCircleDot, IconPlus} from "@tabler/icons-react";
import {useParams, useRouter} from "next/navigation";
import {Flow, FlowType} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {FlowCreateDialogComponent} from "@edition/flow/components/FlowCreateDialogComponent";
import {FlowFolderComponent, FlowFolderComponentHandle} from "@edition/flow/components/folder/FlowFolderComponent";
import {FlowDeleteDialogComponent} from "@edition/flow/components/FlowDeleteDialogComponent";
import {
    FlowFolderContextMenuComponentGroupData,
    FlowFolderContextMenuComponentItemData
} from "@edition/flow/components/folder/FlowFolderContextMenuComponent";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

export const FlowFolderView: React.FC = () => {

    const router = useRouter()
    const params = useParams()
    const flowService = useService(FlowService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`
    const ref = React.useRef<FlowFolderComponentHandle>(null)

    const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
    const [flowTypeId, setFlowTypeId] = React.useState<FlowType['id']>(undefined)

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [contextData, setContextData] = React.useState<FlowFolderContextMenuComponentGroupData | FlowFolderContextMenuComponentItemData>({
        flow: [],
        name: "",
        type: "folder"
    })

    const deleteFlow = React.useCallback((flow: Flow) => {
        if (!flow?.id) return
        flowService.flowDelete({
            flowId: flow.id!
        }).then(payload => {
            if ((payload?.errors?.length ?? 0) <= 0) {
                addIslandSuccessNotification({
                    message: "Deleted flow"
                })
                router.push(`/namespace/${namespaceIndex}/project/${projectIndex}/flow`)
            }
        })
    }, [flowService])

    return <>

        <FlowCreateDialogComponent open={createDialogOpen}
                                   onOpenChange={(open) => setCreateDialogOpen(open)}
                                   flowTypeId={flowTypeId}/>

        <FlowDeleteDialogComponent open={deleteDialogOpen}
                                   onOpenChange={(open) => setDeleteDialogOpen(open)}
                                   contextData={contextData}
                                   onDelete={deleteFlow}/>
        <Flex style={{gap: "0.7rem"}} align={"center"} justify={"space-between"}>
            <Text pl={0.7} hierarchy={"tertiary"}>
                Workflows
            </Text>
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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button data-qa-selector={"flow-send"}
                                paddingSize={"xxs"}
                                color={"tertiary"}
                                onClick={() => {
                                    setCreateDialogOpen(true)
                                    setFlowTypeId(undefined)
                                }}>
                            <IconPlus size={13}/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side={"bottom"}>
                            <Text>Create workflow</Text>
                            <TooltipArrow/>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            </ButtonGroup>
        </Flex>
        <Spacing spacing={"xxs"}/>
        <FlowFolderComponent ref={ref} activeFlowId={flowId}
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
    </>
}