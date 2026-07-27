"use client"

import React from "react";
import {
    AuroraBackground,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing
} from "@code0-tech/pictor";
import {useParams} from "next/navigation";
import {Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceStatsView} from "@edition/namespace/views/NamespaceStatsView";
import {ProjectTableView} from "@edition/project/views/ProjectTableView";
import {ApplicationAttentionFlowsComponent} from "@edition/application/components/ApplicationAttentionFlowsComponent";

export const NamespaceOverviewPage: React.FC = () => {

    const params = useParams()
    const namespaceIndex = params.namespaceId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`

    return <div style={{
        background: "var(--primary)",
        height: "100%",
        position: "relative",
        boxSizing: "border-box",
        borderRadius: "1rem",
        padding: "1rem",
    }}>
        <ScrollArea h={"100%"} type={"scroll"}>
            <ScrollAreaViewport>
                <div style={{maxWidth: "52rem", margin: "0 auto", padding: "4rem 1rem"}}>
                    <NamespaceStatsView/>
                    <Spacing spacing={"xl"}/>
                    <ApplicationAttentionFlowsComponent namespaceId={namespaceId}/>
                    <Spacing spacing={"xl"}/>
                    <ProjectTableView/>
                </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation={"vertical"}>
                <ScrollAreaThumb/>
            </ScrollAreaScrollbar>
        </ScrollArea>
    </div>
}