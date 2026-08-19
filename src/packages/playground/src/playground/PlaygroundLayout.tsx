"use client"

import React from "react";
import {PlaygroundMockData, PlaygroundProvider} from "./PlaygroundProvider";

export const PlaygroundLayout: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const [data, setData] = React.useState<PlaygroundMockData | null>(null)

    React.useEffect(() => {
        fetch("/api/playground-mock")
            .then(response => response.json())
            .then(setData)
    }, [])

    if (!data) return null

    return <PlaygroundProvider data={data}>{children}</PlaygroundProvider>
}
