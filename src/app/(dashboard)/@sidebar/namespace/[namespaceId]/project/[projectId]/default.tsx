"use client"

import {Flex} from "@code0-tech/pictor";
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";
import {NamespaceMenuView} from "@edition/namespace/views/NamespaceMenuView";

export default () => {
    return <Flex h={"100%"} style={{boxSizing: "border-box", flexDirection: 'column'}}>
        <FlowFolderView/>
        <div style={{marginTop: "auto"}}>
            <NamespaceMenuView/>
        </div>
    </Flex>
}
