import React from "react";
import {ViewportPortal} from "@xyflow/react";
import {Spacing, Text} from "@code0-tech/pictor";
import {LineWobble} from 'ldrs/react'
import 'ldrs/react/LineWobble.css'

export const FlowBuilderLoadingComponent: React.FC = () => {

    const [index, setIndex] = React.useState(0)

    const loadingTexts = React.useMemo(() => [
        "Preparing flow data",
        "Loading node and edge definitions",
        "Calculating perfect layout"
    ], [])

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex(current => (current + 1) % loadingTexts.length)
        }, 2000)

        return () => clearInterval(intervalId)
    }, [loadingTexts])

    return (
        <ViewportPortal>
            <div style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                position: 'absolute',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column"
            }}>
                <LineWobble
                    size="200"
                    stroke="5"
                    bgOpacity="0.5"
                    speed="2"
                    color="rgba(255, 255, 255, 0.15)"
                />
                <Spacing spacing={"xl"}/>
                <Text size="md">{loadingTexts[index]}</Text>
                <Spacing spacing={"xs"}/>
                <Text hierarchy={"tertiary"} style={{
                    margin: "0 20%",
                    textAlign: "center"
                }}>
                    We are running requests to prepare your flow. This may take a few moments.
                </Text>
            </div>
        </ViewportPortal>
    )
}
