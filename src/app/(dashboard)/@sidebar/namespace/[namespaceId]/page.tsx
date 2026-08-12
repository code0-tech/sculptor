"use client"

import {ProjectListView} from "@edition/project/views/ProjectListView";
import {FlowRecentListView} from "@edition/flow/views/FlowRecentListView";
import {NamespaceMenuView} from "@edition/namespace/views/NamespaceMenuView";
import {NamespaceUpgradeView} from "@edition/namespace/views/NamespaceUpgradeView";
import {Flex} from "@code0-tech/pictor";

export default () => {
    return <Flex h={"100%"} pt={0.5} style={{boxSizing: "border-box", flexDirection: 'column', gap: "1.3rem"}}>
        <ProjectListView/>
        <div style={{borderTop: "1px dashed rgba(255,255,255, .1)"}}/>
        <FlowRecentListView/>
        <Flex style={{marginTop: "auto", flexDirection: "column", gap: "0.7rem"}}>
            <NamespaceUpgradeView/>
            <NamespaceMenuView/>
        </Flex>
    </Flex>
}
