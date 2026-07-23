import {
    AuroraBackground,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing
} from "@code0-tech/pictor";
import React from "react";
import {NamespaceRowView} from "@edition/namespace/views/NamespaceRowView";
import {ApplicationStatsView} from "@edition/application/views/ApplicationStatsView";
import {ApplicationAttentionFlowsComponent} from "@edition/application/components/ApplicationAttentionFlowsComponent";

export const ApplicationPage = () => {
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
                    <ApplicationStatsView/>
                    <Spacing spacing={"xl"}/>
                    <ApplicationAttentionFlowsComponent/>
                    <Spacing spacing={"xl"}/>
                    <NamespaceRowView/>
                </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation={"vertical"}>
                <ScrollAreaThumb/>
            </ScrollAreaScrollbar>
        </ScrollArea>
    </div>

}