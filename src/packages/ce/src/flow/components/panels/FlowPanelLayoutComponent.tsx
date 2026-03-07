import React from "react";
import {IconLayout, IconLayoutDistributeHorizontal, IconLayoutDistributeVertical} from "@tabler/icons-react";
import {Panel} from "@xyflow/react";
import {
    SegmentedControl,
    SegmentedControlItem, Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";

export interface FlowPanelLayoutComponentProps {

}

export const FlowPanelLayoutComponent: React.FC<FlowPanelLayoutComponentProps> = (props) => {

    const {} = props

    return <Panel position={"top-center"}>
        <SegmentedControl type={"single"} defaultValue={"horizontal"}>
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
        </SegmentedControl>
    </Panel>
}