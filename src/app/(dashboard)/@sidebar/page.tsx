"use client"

import {Flex} from "@code0-tech/pictor";
import {NamespaceListView} from "@edition/namespace/views/NamespaceListView";
import {ProjectRecentListView} from "@edition/project/views/ProjectRecentListView";

export default () => {
    return <div style={{
        height: "100%",
        boxSizing: "border-box",
        marginTop: "0.5rem",
    }}>
        <Flex h={"100%"} style={{boxSizing: "border-box", flexDirection: 'column', gap: "1.3rem"}}>
            <NamespaceListView/>
            <div style={{
                borderTop: "1px dashed rgba(255,255,255, .1)",
            }}/>
            <ProjectRecentListView/>
        </Flex>
    </div>
}