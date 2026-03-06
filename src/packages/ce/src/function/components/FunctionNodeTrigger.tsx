import React, {memo} from "react";
import {Handle, Node, NodeProps, Position, useReactFlow, useStore} from "@xyflow/react";
import {Badge, Card, Flex, Text, useService, useStore as usePictorStore} from "@code0-tech/pictor";
import {FunctionNodeProps} from "@edition/function/components/FunctionNodeComponent";
import {FileTabsService} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowTypeService";
import {FlowService} from "@edition/flow/services/Flow.service";
import {IconBolt} from "@tabler/icons-react";
import {FunctionFileTrigger} from "@edition/function/components/FunctionFileTrigger";


export type FunctionNodeTriggerProps = NodeProps<Node<FunctionNodeProps>>

export const FunctionNodeTrigger: React.FC<FunctionNodeTriggerProps> = memo((props) => {

    const {data, id} = props
    const fileTabsService = useService(FileTabsService)
    const flowInstance = useReactFlow()
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = usePictorStore(FlowTypeService)
    const flowService = useService(FlowService)
    const flowStore = usePictorStore(FlowService)

    const flow = React.useMemo(() => flowService.getById(data.flowId), [flowStore, data])
    const definition = React.useMemo(() => flow ? flowTypeService.getById(flow.type?.id) : undefined, [flowTypeStore, flow])

    const width = props.width ?? 0
    const height = props.height ?? 0
    const viewportWidth = useStore(s => s.width)
    const viewportHeight = useStore(s => s.height)

    React.useEffect(() => {
        if (!definition?.id || !flow) return
        fileTabsService.registerTab({
            id: definition?.id!!,
            active: true,
            closeable: true,
            children: <>
                <IconBolt size={12}/>
                <Text size={"sm"}>{definition?.names!![0]?.content}</Text>
            </>,
            content: <FunctionFileTrigger instance={flow}/>,
            show: true
        })
    }, [definition, data.instance, fileTabsService, flow])

    return <Card variant={"normal"}
                 color={"info"}
                 paddingSize={"xs"}
                 key={id}
                 data-flow-refernce={id}
                 className={`d-flow-node ${fileTabsService.getActiveTab()?.id == definition?.id ? "d-flow-node--active" : undefined}`}
                 onClick={() => {
                     flowInstance.setViewport({
                         x: (viewportWidth / 2) + (props.positionAbsoluteX * -1) - (width / 2),
                         y: (viewportHeight / 2) + (props.positionAbsoluteY * -1) - (height / 2),
                         zoom: 1
                     }, {
                         duration: 250,
                     })
                     fileTabsService.activateTab(definition?.id!!)
                 }}>

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