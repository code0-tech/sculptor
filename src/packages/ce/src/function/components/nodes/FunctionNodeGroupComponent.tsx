import React, {memo} from "react";
import {Handle, Node, NodeProps, Position} from "@xyflow/react";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {Card, withAlpha} from "@code0-tech/pictor";

export type FunctionNodeGroupComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeGroupComponent: React.FC<FunctionNodeGroupComponentProps> = memo((props) => {

    const {data, id} = props

    return (
        <Card key={id}
              w={"100%"}
              h={"100%"}
              style={{
                  background: `color-mix(in srgb, ${data.color} 10%, #030014)`,
                  border: `2px dashed ${withAlpha(data.color, 0.1)}`
              }}>
            <Handle
                type="target"
                position={Position.Top}
                className={"d-flow-node__handle d-flow-node__handle--target"}
                isConnectable={false}
                draggable={false}
                style={{top: "0px", left: "50%", transform: "translateX(-50%)"}}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className={"d-flow-node__handle d-flow-node__handle--source"}
                isConnectable={false}
                draggable={false}
                style={{bottom: "0px", left: "50%", transform: "translateX(-50%)"}}
            />
        </Card>
    );
});
