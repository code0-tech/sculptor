import React from "react";
import {Flow} from "@code0-tech/sagittarius-graphql-types";
import {Button, useService, useStore} from "@code0-tech/pictor";
import {Panel} from "@xyflow/react";
import {FlowService} from "@edition/flow/services/Flow.service";

export interface FlowPanelExportComponentProps {
    flowId: Flow['id']
}

export const FlowPanelExportComponent: React.FC<FlowPanelExportComponentProps> = (props) => {

    //props
    const {flowId} = props

    //services and stores
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)

    const flow = React.useMemo(
        () => flowService.getById(flowId),
        [flowId, flowStore]
    )

    const downloadFlowAsJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${flowId}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    return <Panel position={"top-left"}>
        <Button onClick={downloadFlowAsJson}>
            Download as JSON
        </Button>
    </Panel>

}
