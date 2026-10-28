import React from "react";
import {Handle, Position} from "@xyflow/react";
import {useFlowLayoutHorizontal} from "@edition/flow/hooks/Flow.layout.hook";

export interface FunctionNodeHandlesComponentProps {
    isParameter?: boolean
}

export const FunctionNodeHandlesComponent: React.FC<FunctionNodeHandlesComponentProps> = (props) => {

    const {isParameter} = props

    const isHorizontal = useFlowLayoutHorizontal()

    const targetPosition = React.useMemo(() => {
        if (isParameter) return isHorizontal ? Position.Bottom : Position.Right
        return isHorizontal ? Position.Left : Position.Top
    }, [isParameter, isHorizontal])

    const sourcePosition = React.useMemo(() => {
        if (isParameter) return isHorizontal ? Position.Top : Position.Left
        return isHorizontal ? Position.Right : Position.Bottom
    }, [isParameter, isHorizontal])

    const paramPosition = React.useMemo(() => {
        return isHorizontal ? Position.Bottom : Position.Right
    }, [isHorizontal])

    const targetStyle = React.useMemo(() => {
        if (isParameter) return isHorizontal ? {bottom: "5px"} : {right: "5px"}
        return isHorizontal ? {left: "5px"} : {top: "5px"}
    }, [isParameter, isHorizontal])

    const sourceStyle = React.useMemo(() => {
        if (isParameter) return isHorizontal ? {top: "5px"} : {left: "5px"}
        return isHorizontal ? {right: "5px"} : {bottom: "5px"}
    }, [isParameter, isHorizontal])

    return (
        <>
            <Handle
                isConnectable={false}
                draggable={false}
                type="target"
                className={"d-flow-node__handle d-flow-node__handle--target"}
                style={targetStyle}
                position={targetPosition}
            />

            <Handle
                type={"target"}
                position={paramPosition}
                id={"param"}
                isConnectable={false}
                className={"d-flow-node__handle d-flow-node__handle--target"}
            />

            <Handle
                isConnectable={false}
                type="source"
                style={sourceStyle}
                className={"d-flow-node__handle d-flow-node__handle--source"}
                position={sourcePosition}
            />
        </>
    )
}
