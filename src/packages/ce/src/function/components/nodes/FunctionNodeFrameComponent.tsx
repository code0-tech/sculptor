import React from "react";
import {Flex} from "@code0-tech/pictor";

export interface FunctionNodeFrameComponentProps {
    label: React.ReactNode
    gap?: string
    children: React.ReactNode
}

export const FunctionNodeFrameComponent: React.FC<FunctionNodeFrameComponentProps> = (props) => {

    const {label, gap = "0.35rem", children} = props

    return (
        <Flex align={"center"} style={{flexDirection: "column", gap}}>
            <div aria-hidden={true} style={{visibility: "hidden", pointerEvents: "none"}}>
                {label}
            </div>
            {children}
            {label}
        </Flex>
    )
}
