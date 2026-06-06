import React from "react";
import {Panel, useOnViewportChange, useReactFlow} from "@xyflow/react";
import {IconFocusCentered, IconMinus, IconPlus} from "@tabler/icons-react";
import {Badge, Button, Flex, Text} from "@code0-tech/pictor";
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
        reactFlow.fitView()
    }, [reactFlow])

    return <Panel position="bottom-left">
        <Flex align="center" style={{gap: ".35rem"}}>
            <ButtonGroup>
                <Button style={{border: "none"}} variant={"filled"} paddingSize={"xxs"} color={"secondary"}
                        onClick={() => zoomIn()}><IconPlus size={13}/></Button>
                <Button style={{border: "none"}} variant={"filled"} paddingSize={"xxs"} color={"secondary"}
                        onClick={() => zoomOut()}><IconMinus size={13}/></Button>
                <Button style={{border: "none"}} variant={"filled"} paddingSize={"xxs"} color={"secondary"}
                        onClick={() => center()}><IconFocusCentered size={13}/></Button>
            </ButtonGroup>
            <Badge color={"primary"} style={{boxShadow: "none"}}>
                <Text>{zoomDisplay}</Text>
            </Badge>
        </Flex>
    </Panel>

}