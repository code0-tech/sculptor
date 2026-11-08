import React from "react";
import {Flex, Text} from "@code0-tech/pictor";

export interface FunctionNodeLabelComponentProps {
    name: string
    moduleName?: string
}

export const FunctionNodeLabelComponent: React.FC<FunctionNodeLabelComponentProps> = (props) => {

    const {name, moduleName} = props

    return (
        <div style={{width: 0, minWidth: 0}}>
            <Flex align={"center"} style={{
                flexDirection: "column",
                width: "75px",
                textAlign: "center",
                transform: "translateX(-50%)"
            }}>
                <Text size={"xs"} hierarchy={"primary"}>
                    {name}
                </Text>
                {moduleName ? (
                    <Text size={"xxs"} hierarchy={"tertiary"}>
                        {moduleName}
                    </Text>
                ) : null}
            </Flex>
        </div>
    )
}
