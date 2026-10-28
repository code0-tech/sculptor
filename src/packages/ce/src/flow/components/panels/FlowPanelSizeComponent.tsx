import React from "react";
import {Panel, useOnViewportChange, useReactFlow} from "@xyflow/react";
import {IconFocusCentered, IconMinus, IconPlus} from "@tabler/icons-react";
import {
    Button,
    Flex,
    getSize,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger
} from "@code0-tech/pictor";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {useThrottledCallback} from "use-debounce";

export const FlowPanelSizeComponent: React.FC = () => {

    const reactFlow = useReactFlow();
    const [zoomDisplay, setZoomDisplay] = React.useState("100%");

    const updateZoomThrottled = useThrottledCallback((zoom: number) => {
        setZoomDisplay(`${Math.round(zoom * 100)}%`);
    }, 500);

    useOnViewportChange({
        onChange: (viewport) => {
            updateZoomThrottled(viewport.zoom);
        },
    });

    const zoomIn = React.useCallback(() => {
        reactFlow.zoomIn()
    }, [reactFlow])

    const zoomOut = React.useCallback(() => {
        reactFlow.zoomOut()
    }, [reactFlow])

    const center = React.useCallback(() => {
        reactFlow.fitView({
            padding: "15%"
        })
    }, [reactFlow])

    return <Panel position="bottom-left">
        <Flex align="center" style={{flexDirection: "column", gap: ".35rem"}}>
            <Text>{zoomDisplay}</Text>
            <ButtonGroup>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button style={{border: "none", padding: getSize("xs")}} variant={"none"} color={"secondary"}
                                onClick={() => zoomIn()}><IconPlus size={13}/></Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side={"right"} sideOffset={8}>
                            <Text>Zoom in</Text>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button style={{border: "none", padding: getSize("xs")}} variant={"none"} color={"secondary"}
                                onClick={() => zoomOut()}><IconMinus size={13}/></Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side={"right"} sideOffset={8}>
                            <Text>Zoom out</Text>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button style={{border: "none", padding: getSize("xs")}} variant={"none"} color={"secondary"}
                                onClick={() => center()}><IconFocusCentered size={13}/></Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent side={"right"} sideOffset={8}>
                            <Text>Center flow</Text>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            </ButtonGroup>
        </Flex>
    </Panel>

}
