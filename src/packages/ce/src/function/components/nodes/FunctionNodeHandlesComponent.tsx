import React from "react";
import {Handle, Position} from "@xyflow/react";

export interface FunctionNodeHandlesComponentProps {
    isParameter?: boolean
}

export const FunctionNodeHandlesComponent: React.FC<FunctionNodeHandlesComponentProps> = (props) => {

    const {isParameter} = props

    return (
        <>
            <Handle
                isConnectable={false}
                draggable={false}
                type="target"
                className={"d-flow-node__handle d-flow-node__handle--target"}
                style={{...(isParameter ? {right: "5px"} : {top: "5px"})}}
                position={isParameter ? Position.Right : Position.Top}
            />

            <Handle
                type={"target"}
                position={Position.Right}
                id={"param"}
                isConnectable={false}
                className={"d-flow-node__handle d-flow-node__handle--target"}
            />

            <Handle
                isConnectable={false}
                type="source"
                style={{...(isParameter ? {left: "5px"} : {bottom: "5px"})}}
                className={"d-flow-node__handle d-flow-node__handle--source"}
                position={isParameter ? Position.Left : Position.Bottom}
            />
        </>
    )
}
