"use client"

import React from "react";
import {useParams, useSearchParams} from "next/navigation";
import {PlaygroundFlowView} from "./PlaygroundFlowView";

export const PlaygroundPage: React.FC = () => {
    const params = useParams()
    const searchParams = useSearchParams()

    const flowIndex = Number(params.flowId) || 1
    const readonly = searchParams.get("readonly") === "1"

    return <PlaygroundFlowView flowIndex={flowIndex} readonly={readonly}/>
}
