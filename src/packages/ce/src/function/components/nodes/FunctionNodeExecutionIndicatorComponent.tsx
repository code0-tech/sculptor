import React from "react";
import {IconCheck, IconX} from "@tabler/icons-react";
import {Tailspin} from "ldrs/react";
import "ldrs/react/Tailspin.css";
import "./FunctionNodeComponent.style.scss";
import {useFlowExecutionNodeStatus} from "@edition/flow/hooks/Flow.executionAnimation.hook";

export interface FunctionNodeExecutionIndicatorComponentProps {
    nodeId: string
}

export const FunctionNodeExecutionIndicatorComponent: React.FC<FunctionNodeExecutionIndicatorComponentProps> = (props) => {

    const {nodeId} = props

    const status = useFlowExecutionNodeStatus(nodeId)

    if (!status) return null

    return (
        <div className={`d-flow-node-execution__indicator d-flow-node-execution__indicator--${status}`}>
            {status === "success" ? <IconCheck size={16}/> : null}
            {status === "error" ? <IconX size={16}/> : null}
            {status === "idle" || status === "running"
                ? <Tailspin size={16} stroke={2} speed={0.9} color={"currentColor"}/>
                : null}
        </div>
    )
}
