"use client"

import React from "react";
import {notFound} from "next/navigation";
import {PlaygroundMockData, PlaygroundProvider} from "./PlaygroundProvider";

export const PlaygroundLayout: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const [data, setData] = React.useState<PlaygroundMockData | null>(null)
    const [missing, setMissing] = React.useState(false)

    React.useEffect(() => {
        fetch("/api/playground-mock")
            .then(response => response.ok ? response.json().then(setData) : setMissing(true))
    }, [])

    if (missing) notFound()

    if (!data) return null

    return <PlaygroundProvider data={data}>{children}</PlaygroundProvider>
}
