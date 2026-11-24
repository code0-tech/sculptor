import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import React, {memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {Flex} from "@code0-tech/pictor";
import {useFlowLayoutHorizontal} from "@edition/flow/hooks/Flow.layout.hook";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {FunctionNodeLabelComponent} from "@edition/function/components/nodes/FunctionNodeLabelComponent";

export type FunctionNodeSlotComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeSlotComponent: React.FC<FunctionNodeSlotComponentProps> = memo((props) => {

    const {data} = props

    const isHorizontal = useFlowLayoutHorizontal()
    // an along flow slot stands where its group will stand, so it faces the node the way a group does
    const isAcross = isHorizontal !== !!data.alongFlow

    const handle = <div style={{width: 22, height: 22, position: "relative"}}>
        <Handle
            isConnectable={false}
            type={"source"}
            position={isAcross ? Position.Top : Position.Left}
            style={{
                opacity: 0,
                top: isAcross ? "5px" : "50%",
                left: isAcross ? "50%" : "5px"
            }}
        />
    </div>

    if (data.alongFlow) return handle

    return (
        <Flex align={"center"}
              style={{flexDirection: isHorizontal ? "column" : "row", gap: "0.35rem"}}>
            <div aria-hidden={true} style={{visibility: "hidden", pointerEvents: "none"}}>
                <FunctionNodeLabelComponent name={" "} moduleName={" "}/>
            </div>

            {handle}
        </Flex>
    )
})
