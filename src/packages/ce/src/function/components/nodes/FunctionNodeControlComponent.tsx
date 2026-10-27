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

export type FunctionNodeControlComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeControlComponent: React.FC<FunctionNodeControlComponentProps> = memo((props) => {

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
                    miw={"50px"}
                    mah={"50px"}
                    w={"50px"}
                    h={"50px"}
                        borderColor={isActive ? "info" : undefined}
                    className={`d-flow-node ${isActive ? "d-flow-node--active" : ""} ${isDimmed ? "d-flow-node--notReferenced" : ""}`}
                    color={"primary"} style={{
                    aspectRatio: "50/50",
                    transform: "rotate(45deg)",
                    ...(isHighlighted ? {boxShadow: `0 0 5rem 0 ${withAlpha(data.color, 0.25)}`} : {}),
                }}>

                    <FunctionNodeToolbarComponent/>

                    <div style={{
                        position: "absolute",
                        inset: 0,
                        transform: "rotate(-45deg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>

                        <FunctionNodeHandlesComponent isParameter={data.isParameter}/>

                        <Flex align={"center"} style={{flexDirection: "column", gap: "0.35rem", ...validationStyle}}>
                            <DisplayIcon color={iconColor} size={16} style={{width: "16px", height: "16px"}}/>
                        </Flex>

                    </div>

                </Card>
                {isHighlighted ? (
                    <FunctionNodeReferenceIndicatorComponent color={data.color}/>
                ) : null}
            </div>
            <FunctionNodeLabelComponent name={name} moduleName={moduleName}/>
        </Flex>
    );
})
