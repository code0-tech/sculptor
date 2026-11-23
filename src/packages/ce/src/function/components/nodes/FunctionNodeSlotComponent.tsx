import {Handle, Position} from "@xyflow/react";
import React, {memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {Flex} from "@code0-tech/pictor";
import {useFlowLayoutHorizontal} from "@edition/flow/hooks/Flow.layout.hook";
import {FunctionNodeLabelComponent} from "@edition/function/components/nodes/FunctionNodeLabelComponent";

export const FunctionNodeSlotComponent: React.FC = memo(() => {

    const isHorizontal = useFlowLayoutHorizontal()

    return (
        <Flex align={"center"}
              style={{flexDirection: isHorizontal ? "column" : "row", gap: "0.35rem"}}>
            <div aria-hidden={true} style={{visibility: "hidden", pointerEvents: "none"}}>
                <FunctionNodeLabelComponent name={" "} moduleName={" "}/>
            </div>

            <div style={{width: 22, height: 22, position: "relative"}}>
                <Handle
                    isConnectable={false}
                    type={"source"}
                    position={isHorizontal ? Position.Top : Position.Left}
                    style={{
                        opacity: 0,
                        top: isHorizontal ? "5px" : "50%",
                        left: isHorizontal ? "50%" : "5px"
                    }}
                />
            </div>
        </Flex>
    )
})
