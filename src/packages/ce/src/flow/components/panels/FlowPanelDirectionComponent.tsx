import React from "react";
import {Panel} from "@xyflow/react";
import {
    SegmentedControl,
    SegmentedControlItem,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";
import {IconLayoutDistributeHorizontal, IconLayoutDistributeVertical} from "@tabler/icons-react";
import {FlowLayoutDirection, useFlowLayoutStore} from "@edition/flow/hooks/Flow.layout.hook";

export const FlowPanelDirectionComponent: React.FC = () => {

    const direction = useFlowLayoutStore(state => state.direction)
    const setDirection = useFlowLayoutStore(state => state.setDirection)

    return <Panel position={"bottom-right"} data-qa-selector={"flow-builder-panel-direction"}>
        <SegmentedControl type={"single"}
                          orientation={"vertical"}
                          style={{flexDirection: "column"}}
                          value={direction}
                          onValueChange={(value: string) => {
                              if (!value) return
                              setDirection(value as FlowLayoutDirection)
                          }}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SegmentedControlItem value={"vertical"}>
                        <IconLayoutDistributeHorizontal size={13}/>
                    </SegmentedControlItem>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"left"} sideOffset={8}>
                        <Text>Vertical layout</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SegmentedControlItem value={"horizontal"}>
                        <IconLayoutDistributeVertical size={13}/>
                    </SegmentedControlItem>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent side={"left"} sideOffset={8}>
                        <Text>Horizontal layout</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
        </SegmentedControl>
    </Panel>
}
