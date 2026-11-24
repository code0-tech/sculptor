import React from "react";
import {Flex, Text} from "@code0-tech/pictor";

export interface FunctionNodeLabelComponentProps {
    name: string
    moduleName?: string
}

// the frame mirrors this label as an invisible spacer above the card, so the node measures twice the
// label height - a name wrapping to one line instead of two would move the node's whole parameter lane.
// the block reserves room for two name lines plus the module, and the reserve goes below it so the
// module stays against the name. longer names grow instead of being cut off
export const FunctionNodeLabelComponent: React.FC<FunctionNodeLabelComponentProps> = (props) => {

    const {name, moduleName} = props

    return (
        <div style={{width: 0, minWidth: 0}}>
            <Flex align={"center"} style={{
                flexDirection: "column",
                width: "75px",
                minHeight: "3.25rem",
                textAlign: "center",
                transform: "translateX(-50%)"
            }}>
                <Text size={"xs"} ta={"center"} hierarchy={"primary"}>
                    {name}
                </Text>
                {moduleName ? (
                    <Text size={"xxs"} ta={"center"} hierarchy={"tertiary"}>
                        {moduleName}
                    </Text>
                ) : null}
            </Flex>
        </div>
    )
}
