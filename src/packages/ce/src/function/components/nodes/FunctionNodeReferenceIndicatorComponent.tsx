import React from "react";
import {IconVariable} from "@tabler/icons-react";

export interface FunctionNodeReferenceIndicatorComponentProps {
    color: string
}

export const FunctionNodeReferenceIndicatorComponent: React.FC<FunctionNodeReferenceIndicatorComponentProps> = (props) => {

    const {color} = props

    return (
        <div className={"d-flow-node__isReferenced"} style={{
            position: "absolute",
            top: "50%",
            left: "-0.5rem",
            transform: "translate(-100%, -50%)",
            display: "flex"
        }}>
            <IconVariable className={"d-flow-node__isReferenced-icon"} color={color} size={13}/>
        </div>
    )
}
