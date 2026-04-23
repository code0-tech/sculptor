import React from "react";
import {Flow, Namespace, NamespaceProject, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {
    Button,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuSeparator,
    MenuTrigger,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {
    FileTabs,
    FileTabsContent,
    FileTabsList,
    FileTabsTrigger
} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs";
import {IconPlus} from "@tabler/icons-react";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {setSelectedFunctionNode, useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";
import {useReactFlow} from "@xyflow/react";
import {FunctionFileDefaultComponent} from "@edition/function/components/files/FunctionFileDefaultComponent";
import {FunctionFileTriggerComponent} from "@edition/function/components/files/FunctionFileTriggerComponent";
import {FALLBACK_FLOW_TYPE_NAME, FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowView} from "@edition/flow/services/Flow.view";
import {icon, IconString} from "@core/util/icons";

export interface FunctionFilesComponentProps {
    flowId: Flow['id']
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
}

export const FunctionFilesComponent: React.FC<FunctionFilesComponentProps> = (props) => {

    const {flowId, namespaceId, projectId} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const id = React.useId()
    const [activeTab, setActiveTab] = React.useState<string>()
    const reactFlow = useReactFlow()
    const selectedNode = useSelectedFunctionNode()

    const flow: FlowView = React.useMemo(
        () => {

            const flow = flowService.getById(flowId, {namespaceId, projectId})
            return {
                ...flow,
                type: flowTypeService.getById(flow?.type?.id)
            }
        },
        [flowStore, flowTypeStore]
    )

    const DisplayIcon = React.useMemo(
        () => icon(flow?.type?.displayIcon as IconString),
        [flow]
    )

    const nodes: NodeFunction[] = React.useMemo(
        () => flow?.nodes?.nodes?.map(node => ({
            ...node,
            functionDefinition: functionService.getById(node?.functionDefinition?.id!)
        })) || [],
        [flow, functionStore]
    )

    React.useEffect(() => {
        if (activeTab) setSelectedFunctionNode(activeTab, reactFlow);
        setTimeout(() => {
            const parent = document.querySelector("[data-id=" + '"' + id + '"' + "]") as HTMLDivElement
            const tabList = parent?.querySelector(".file-tabs__list-content") as HTMLDivElement
            const trigger = tabList?.querySelector("[data-value=" + '"' + activeTab + '"' + "]") as HTMLDivElement

            if (tabList && trigger) {
                const offset = (trigger.offsetLeft + (trigger.offsetWidth / 2)) - (tabList.offsetWidth / 2)
                tabList.scrollLeft = 0 //reset to 0
                tabList.scrollBy({
                    left: offset,
                    behavior: 'smooth'
                });
            }
        }, 0)
    }, [activeTab, id])

    React.useEffect(() => {
        if (selectedNode) setActiveTab(selectedNode.id)
    }, [selectedNode])

    return (
        <FileTabs
            data-id={id}
            value={activeTab}
            onValueChange={setActiveTab}
        >
            <Layout showLayoutSplitter={false} layoutGap={"0"} topContent={<FileTabsList
                controls={
                    <Menu>
                        <MenuTrigger asChild>
                            <Button variant="none" paddingSize={"xxs"} color="primary">
                                <IconPlus size={12}/>
                            </Button>
                        </MenuTrigger>
                        <MenuPortal>
                            <MenuContent align="start" sideOffset={8}>
                                <MenuLabel>Starting Node</MenuLabel>
                                <MenuItem onSelect={() => setActiveTab(flowId!)}>
                                    <DisplayIcon color={hashToColor(flowId!)} size={13}/>
                                    <Text
                                        size={"sm"}>{flow?.type?.names?.[0]?.content || FALLBACK_FLOW_TYPE_NAME}</Text>
                                </MenuItem>
                                <MenuSeparator/>
                                <MenuLabel>Available Node</MenuLabel>
                                {
                                    nodes?.map(node => {

                                        const DisplayIcon = icon(node?.functionDefinition?.displayIcon as IconString)

                                        return <MenuItem key={node?.id} onSelect={() => {
                                            setActiveTab(node?.id!)
                                        }}>
                                            <DisplayIcon color={hashToColor(node?.id!)} size={13}/>
                                            <Text
                                                size={"sm"}>{node?.functionDefinition?.names?.[0]?.content || FALLBACK_FUNCTION_NAME}</Text>
                                        </MenuItem>
                                    })
                                }
                            </MenuContent>
                        </MenuPortal>
                    </Menu>
                }
            >
                <FileTabsTrigger value={flowId!}
                                 key={flowId!}>
                    <DisplayIcon color={hashToColor(flowId!)} size={13}/>
                    <Text size={"sm"}>{flow?.type?.names?.[0]?.content || FALLBACK_FLOW_TYPE_NAME}</Text>
                </FileTabsTrigger>
                {
                    nodes?.map(node => {

                        const DisplayIcon = icon(node?.functionDefinition?.displayIcon as IconString)

                        return <FileTabsTrigger value={node?.id!}
                                                key={node?.id!}>
                            <DisplayIcon color={hashToColor(node?.id!)} size={13}/>
                            <Text
                                size={"sm"}>{node?.functionDefinition?.names?.[0]?.content || FALLBACK_FUNCTION_NAME}</Text>
                        </FileTabsTrigger>
                    })
                }
            </FileTabsList>}>
                <>
                    <FileTabsContent data-qa-selector={"flow-builder-file-content"}
                                     value={flowId!}
                                     key={flowId!}>
                        <FunctionFileTriggerComponent instance={flow!}/>
                    </FileTabsContent>
                    {
                        nodes?.map(node => {
                            return <FileTabsContent data-qa-selector={"flow-builder-file-content"}
                                                    value={node?.id!}
                                                    key={node?.id!}>
                                <FunctionFileDefaultComponent node={node!} flowId={flowId}/>
                            </FileTabsContent>
                        })
                    }
                </>
            </Layout>
        </FileTabs>
    );

}