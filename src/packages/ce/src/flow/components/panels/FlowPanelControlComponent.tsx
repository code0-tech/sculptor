import React from "react";
import {
    Flow,
    LiteralValue,
    Namespace,
    NamespaceProject,
    NodeFunction,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {
    Badge,
    Button,
    Spacing,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {Panel} from "@xyflow/react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {FlowService} from "@edition/flow/services/Flow.service";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {useHotkeys} from "react-hotkeys-hook";
import {useSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";
import {useParams} from "next/navigation";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {ModuleService} from "@edition/module/services/Module.service";
import {IconCheck, IconCopy} from "@tabler/icons-react";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {useCopyToClipboard} from "@uidotdev/usehooks";

export interface FlowPanelControlComponentProps {
    flowId: Flow['id']
}

export const FlowPanelControlComponent: React.FC<FlowPanelControlComponentProps> = (props) => {

    //props
    const {flowId} = props

    //services and stores
    const params = useParams()
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)

    const [copiedText, copyToClipboard] = useCopyToClipboard();
    const hasCopiedText = Boolean(copiedText);
    const [, startTransition] = React.useTransition()
    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const [addNextNodeTooltipOpen, setAddNextNodeTooltipOpen] = React.useState(false)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    //memoized values
    const selectedNode = useSelectedFunctionNode()
    const result = useFunctionSuggestions()

    const flow = React.useMemo(
        () => flowService.getById(flowId, {
            namespaceId,
            projectId
        }),
        [flowId, flowStore, namespaceId, projectId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId, {
            namespaceId
        }),
        [projectId, namespaceId, projectStore]
    )

    const flowType = React.useMemo(
        () => flowTypeService.getById(flow?.type?.id, {
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flow?.type?.id, namespaceId, projectId, project?.primaryRuntime?.id, flowTypeStore]
    )

    const module = React.useMemo(
        () => moduleService.getById(flowType?.runtimeModule?.id, {
            namespaceId: namespaceId,
            projectId: projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [flowType?.runtimeModule?.id, namespaceId, projectId, project?.primaryRuntime?.id, moduleStore]
    )

    let endpoint = `http://${module?.definitions?.nodes?.[0]?.host}:${module?.definitions?.nodes?.[0]?.port}${module?.definitions?.nodes?.[0]?.endpoint}`
        .replace("${{project_slug}}", project?.slug ?? "${{project_slug}}")

    flow?.settings?.nodes?.forEach(setting => {
        endpoint = endpoint.replace(`\${{${setting?.flowSettingIdentifier}}}`, setting?.value)
    })

    //callbacks
    const deleteActiveNode = React.useCallback(() => {
        if (!selectedNode) return
        // @ts-ignore
        startTransition(async () => {
            await flowService.deleteNodeById(flowId, selectedNode?.id as NodeFunction['id'])
        })
    }, [selectedNode, flowService, flowStore])

    const addNodeToFlow = React.useCallback((suggestion: NodeFunction | ReferenceValue | LiteralValue | SubFlowValue) => {
        if (flowId && suggestion.__typename === "NodeFunction" && selectedNode?.id.includes("NodeFunction")) {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, selectedNode?.id as NodeFunction['id'], suggestion as NodeFunction)
            })
        } else if (suggestion.__typename === "NodeFunction") {
            startTransition(async () => {
                await flowService.addNextNodeById(flowId, null, suggestion as NodeFunction)
            })
        }
    }, [flowId, flowService, flowStore, selectedNode])

    useHotkeys('shift+a', (keyboardEvent) => {
        if (selectedNode && !selectedNode.data.functionId) setSuggestionDialogOpen(true)
        else setAddNextNodeTooltipOpen(true)
        keyboardEvent.stopPropagation()
        keyboardEvent.preventDefault()
    }, [selectedNode])

    return <Panel position={"bottom-center"} data-qa-selector={"flow-builder-control-panel"}>

        <SuggestionDialogComponent suggestions={result}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={addNodeToFlow}
                                   onOpenChange={setSuggestionDialogOpen}/>

        <ButtonGroup style={{textWrap: "nowrap"}}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button data-qa-selector={"flow-builder-control-panel-delete"}
                            disabled={!selectedNode}
                            onClick={deleteActiveNode}
                            paddingSize={"xxs"}
                            variant={"none"}
                            color={"error"}>
                        <Text>Delete node</Text>
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    <TooltipContent sideOffset={8}>
                        <Text>Select a node to delete it</Text>
                    </TooltipContent>
                </TooltipPortal>
            </Tooltip>
            <Tooltip open={addNextNodeTooltipOpen} onOpenChange={setAddNextNodeTooltipOpen}>
                <TooltipTrigger asChild>
                    <Button data-qa-selector={"flow-builder-control-panel-add"}
                            disabled={!selectedNode || !!selectedNode.data.functionId}
                            paddingSize={"xxs"}
                            variant={"none"}
                            onClick={() => {
                                if (selectedNode && !selectedNode.data.functionId) setSuggestionDialogOpen(true)
                            }}
                            color={"tertiary"}>
                        <Text display={"flex"} align={"center"} style={{gap: "0.35rem"}}>
                            Add next node
                            <Badge style={{gap: 0}}>Shift + A</Badge>
                        </Text>
                    </Button>
                </TooltipTrigger>
                <TooltipPortal>
                    {!selectedNode || !!selectedNode.data.functionId && <TooltipContent sideOffset={8}>
                        <Text>Select a node to add a next node</Text>
                    </TooltipContent>}
                </TooltipPortal>
            </Tooltip>
            {module?.definitions?.nodes?.[0] ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button data-qa-selector={"flow-builder-control-panel-execute"}
                                paddingSize={"xxs"}
                                variant={"none"}
                                color={"tertiary"}>
                            <Text>
                                Execute flow
                            </Text>
                        </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                        <TooltipContent p={0.7} sideOffset={8} color={"secondary"}>
                            <Text>
                                Execute the flow to see the results <br/> in the runtime.
                            </Text>
                            <Spacing spacing={"xs"}/>
                            <InputWrapper title={"Endpoint"} right={
                                <ButtonGroup color={"primary"}>
                                    <Button onClick={() => {
                                        copyToClipboard(endpoint)
                                    }} paddingSize={"xxs"} variant={"none"} color={"secondary"}>
                                        {hasCopiedText ? <IconCheck size={13}/> : <IconCopy size={13}/>}
                                    </Button>
                                </ButtonGroup>
                            }>
                                <div style={{
                                    alignSelf: "center",
                                    flex: "1 1 auto"
                                }}>
                                    <Text>
                                        {endpoint}
                                    </Text>
                                </div>

                            </InputWrapper>
                        </TooltipContent>
                    </TooltipPortal>
                </Tooltip>
            ) : (null as any)}

        </ButtonGroup>


    </Panel>

}
