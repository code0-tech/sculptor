import React from "react";
import {Flex, Text} from "@code0-tech/pictor";

export interface FunctionNodeLabelComponentProps {
    name: string
    moduleName?: string
}

export const FunctionNodeLabelComponent: React.FC<FunctionNodeLabelComponentProps> = (props) => {

    const {name, moduleName} = props

    return (
        <Flex align={"center"} style={{
            flexDirection: "column",
            width: "150%",
            textAlign: "center"
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
    )
}
