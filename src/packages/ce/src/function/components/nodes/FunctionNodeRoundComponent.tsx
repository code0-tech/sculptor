import {Node, NodeProps} from "@xyflow/react";
import React, {memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {Card, Flex, withAlpha} from "@code0-tech/pictor";
import {useFunctionNodeState} from "@edition/function/hooks/FunctionNode.state.hook";
import {FunctionNodeHandlesComponent} from "@edition/function/components/nodes/FunctionNodeHandlesComponent";
import {FunctionNodeLabelComponent} from "@edition/function/components/nodes/FunctionNodeLabelComponent";
import {
    FunctionNodeReferenceIndicatorComponent
} from "@edition/function/components/nodes/FunctionNodeReferenceIndicatorComponent";
import {
    FunctionNodeExecutionIndicatorComponent
} from "@edition/function/components/nodes/FunctionNodeExecutionIndicatorComponent";

export type FunctionNodeRoundComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeRoundComponent: React.FC<FunctionNodeRoundComponentProps> = memo((props) => {

    const {data, id} = props

    const {
        name,
        moduleName,
        displayIcon: DisplayIcon,
        iconColor,
        validationStyle,
        isActive,
        isHighlighted,
        isDimmed
    } = useFunctionNodeState(data, id)

    return (
        <Flex align={"center"} style={{flexDirection: "column", gap: "0.35rem"}}>
            <div className={"d-flow-node-execution"}>
                <Card
                    data-qa-selector={"flow-builder-node"}
                    key={id}
                    data-flow-refernce={id}
                    paddingSize={"xs"}
                    display={"flex"}
                    align={"center"}
                    justify={"center"}
                    miw={"50px"}
                    mah={"50px"}
                    borderColor={isActive ? "info" : undefined}
                    className={`d-flow-node ${isActive ? "d-flow-node--active" : ""} ${isDimmed ? "d-flow-node--notReferenced" : ""}`}
                    color={"primary"} style={{
                    aspectRatio: "50/50",
                    borderRadius: "50%",
                    ...(isHighlighted ? {boxShadow: `0 0 5rem 0 ${withAlpha(data.color, 0.25)}`} : {}),
                }}>

                    <FunctionNodeHandlesComponent isParameter={data.isParameter}/>

                    {isHighlighted ? (
                        <FunctionNodeReferenceIndicatorComponent color={data.color}/>
                    ) : null}

                    <Flex align={"center"} style={{flexDirection: "column", gap: "0.35rem", ...validationStyle}}>
                        <DisplayIcon color={iconColor} size={16} style={{width: "16px", height: "16px"}}/>
                    </Flex>
                </Card>
                <FunctionNodeExecutionIndicatorComponent nodeId={id}/>
            </div>
            <FunctionNodeLabelComponent name={name} moduleName={moduleName}/>
        </Flex>
    );
})
