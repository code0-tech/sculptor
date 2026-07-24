"use client"

import React from "react";
import {
    AuroraBackground,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport
} from "@code0-tech/pictor";

export const NamespaceOverviewPage: React.FC = () => {

    return <div style={{
        background: "var(--primary)",
        height: "100%",
        position: "relative",
        boxSizing: "border-box",
        borderRadius: "1rem",
        padding: "1rem",
    }}>
        <AuroraBackground/>
        <ScrollArea h={"100%"} type={"scroll"}>
            <ScrollAreaViewport>
                <div style={{maxWidth: "52rem", margin: "0 auto", padding: "4rem 1rem"}}>
                </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation={"vertical"}>
                <ScrollAreaThumb/>
            </ScrollAreaScrollbar>
        </ScrollArea>
    </div>
}