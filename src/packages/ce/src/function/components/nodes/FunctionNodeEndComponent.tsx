import {Node, NodeProps} from "@xyflow/react";
import React, {memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {Card, Flex, withAlpha} from "@code0-tech/pictor";
import {useFunctionNodeState} from "@edition/function/hooks/FunctionNode.state.hook";
import {FunctionNodeToolbarComponent} from "@edition/function/components/nodes/FunctionNodeToolbarComponent";
import {FunctionNodeHandlesComponent} from "@edition/function/components/nodes/FunctionNodeHandlesComponent";
import {FunctionNodeLabelComponent} from "@edition/function/components/nodes/FunctionNodeLabelComponent";
import {
    FunctionNodeReferenceIndicatorComponent
} from "@edition/function/components/nodes/FunctionNodeReferenceIndicatorComponent";

export type FunctionNodeEndComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeEndComponent: React.FC<FunctionNodeEndComponentProps> = memo((props) => {

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
            <div style={{position: "relative", display: "flex", alignItems: "center"}}>
                <Card
                    data-qa-selector={"flow-builder-node"}
                    key={id}
                    data-flow-refernce={id}
                    paddingSize={"xs"}
                    display={"flex"}
                    align={"center"}
                    justify={"center"}
                    miw={"60px"}
                    mah={"60px"}
                    w={"60px"}
                    h={"60px"}
                    borderColor={isActive ? "info" : undefined}
                    className={`d-flow-node d-flow-node--end ${isActive ? "d-flow-node--active" : ""} ${isDimmed ? "d-flow-node--notReferenced" : ""}`}
                    color={"primary"} style={{
                    aspectRatio: "50/50",
                    ...(isHighlighted ? {boxShadow: `0 0 5rem 0 ${withAlpha(data.color, 0.25)}`} : {}),
                }}>

                    <div className={"d-flow-node__outline"}/>

                    <FunctionNodeToolbarComponent/>

                    <FunctionNodeHandlesComponent isParameter={data.isParameter}/>

                    <Flex align={"center"} className={"d-flow-node__shape"}
                          style={{flexDirection: "column", gap: "0.35rem", ...validationStyle}}>
                        <DisplayIcon color={iconColor} size={16} style={{width: "16px", height: "16px"}}/>
                    </Flex>

                </Card>
                {isHighlighted ? (
                    <FunctionNodeReferenceIndicatorComponent color={data.color}/>
                ) : null}
            </div>
            <FunctionNodeLabelComponent name={name} moduleName={moduleName}/>
        </Flex>
    );
})
