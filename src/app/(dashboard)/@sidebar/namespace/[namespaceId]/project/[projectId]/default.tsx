"use client"

import {Flex} from "@code0-tech/pictor";
import {FlowFolderView} from "@edition/flow/views/FlowFolderView";
import {ProjectMenuView} from "@edition/project/views/ProjectMenuView";

export default () => {
    return <Flex h={"100%"} style={{boxSizing: "border-box", flexDirection: 'column'}}>
        <FlowFolderView/>
        <div data-qa-selector={"dashboard-project-menu"} style={{marginTop: "auto"}}>
            <ProjectMenuView/>
        </div>
    </Flex>
}
