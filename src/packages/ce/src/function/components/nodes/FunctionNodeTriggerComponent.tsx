import React, {memo} from "react";
import {Handle, Node, NodeProps, Position, useReactFlow, useStore} from "@xyflow/react";
import {Badge, Card, Flex, Text, useService, useStore as usePictorStore} from "@code0-tech/pictor";
import {FunctionNodeComponentProps} from "@edition/function/components/nodes/FunctionNodeComponent";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {IconBolt} from "@tabler/icons-react";
import {FunctionFileTriggerComponent} from "@edition/function/components/files/FunctionFileTriggerComponent";


export type FunctionNodeTriggerComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeTriggerComponent: React.FC<FunctionNodeTriggerComponentProps> = memo((props) => {

    const {data, id} = props
    const fileTabsService = useService(FileTabsService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = usePictorStore(FlowTypeService)
    const flowService = useService(FlowService)
    const flowStore = usePictorStore(FlowService)

    const flow = React.useMemo(() => flowService.getById(data.flowId), [flowStore, data])
    const definition = React.useMemo(() => flow ? flowTypeService.getById(flow.type?.id) : undefined, [flowTypeStore, flow])

    React.useEffect(() => {
        if (!id || !flow) return
        fileTabsService.registerTab({
            id: id,
            active: true,
            closeable: true,
            children: <>
                <IconBolt size={12}/>
                <Text size={"sm"}>{definition?.names!![0]?.content}</Text>
            </>,
            content: <FunctionFileTriggerComponent instance={flow}/>,
            show: true
        })
    }, [])

    return <Card variant={"normal"}
                 color={"info"}
                 paddingSize={"xs"}
                 key={id}
                 data-flow-refernce={id}
                 className={`d-flow-node ${fileTabsService.getActiveTab()?.id == id ? "d-flow-node--active" : undefined}`}>

        <Badge color={"info"}
               pos={"absolute"}
               top={"-0.35rem"}
               left={"50%"}
               style={{transform: "translate(-50%, -100%)"}}>
            Starting node
        </Badge>

        <Flex style={{gap: "0.7rem"}} align={"center"}>
            <IconBolt size={16}/>
            <Text display={"block"}>
                {definition?.displayMessages!![0]?.content ?? definition?.id}
            </Text>
        </Flex>

        <Handle
            isConnectable={false}
            type="source"
            style={{bottom: "2px"}}
            className={"d-flow-node__handle d-flow-node__handle--source"}
            position={Position.Bottom}
        />
    </Card>


})