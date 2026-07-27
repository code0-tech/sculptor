"use client"

import {Flex} from "@code0-tech/pictor";
import {NamespaceListView} from "@edition/namespace/views/NamespaceListView";
import {ProjectRecentListView} from "@edition/project/views/ProjectRecentListView";

export default () => {
    return <Flex h={"100%"} pt={0.5} style={{boxSizing: "border-box", flexDirection: 'column', gap: "1.3rem"}}>
        <NamespaceListView/>
        <div style={{borderTop: "1px dashed rgba(255,255,255, .1)"}}/>
        <ProjectRecentListView/>
    </Flex>
}