import React from "react";
import {Panel} from "@xyflow/react";
import {Text, useService, useStore} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {Flow, Namespace, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";


export const FlowPanelLayoutComponent: React.FC = () => {

    const params = useParams()
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

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

    return <Panel position={"top-center"}>
        <Text style={{textAlign: "center"}}>{flow?.name}</Text>
        {/*<SegmentedControl type={"single"} defaultValue={"horizontal"}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SegmentedControlItem value={"horizontal"} display={"flex"}>
                        <IconLayoutDistributeHorizontal size={13}/>
                    </SegmentedControlItem>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"bottom"} sideOffset={8}>
                        <Text>Vertical layout</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SegmentedControlItem disabled value={"vertical"} display={"flex"}>
                        <IconLayoutDistributeVertical size={13}/>
                    </SegmentedControlItem>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"bottom"} sideOffset={8}>
                        <Text>Horizontal layout</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SegmentedControlItem disabled value={"manual"} display={"flex"}>
                        <IconLayout size={13}/>
                    </SegmentedControlItem>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"bottom"} sideOffset={8}>
                        <Text>Manual layout</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </SegmentedControl>*/}
    </Panel>
}