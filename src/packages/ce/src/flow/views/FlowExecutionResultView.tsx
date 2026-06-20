import React from "react";
import {useParams} from "next/navigation";
import {
    ExecutionError,
    ExecutionParameterResult,
    ExecutionResult,
    Flow, FunctionDefinition,
    Maybe,
    Namespace,
    NamespaceProject,
    NodeFunction,
    ParameterDefinition
} from "@code0-tech/sagittarius-graphql-types";
import {
    Button,
    ButtonGroup,
    Card,
    Flex,
    Gantt,
    getRelativeValue,
    hashToColor,
    Menu,
    MenuContent,
    MenuItem,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    Tooltip,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore,
    withAlpha
} from "@code0-tech/pictor";
import {FlowService} from "@edition/flow/services/Flow.service";
import {IconPlayerPlayFilled, IconPlus} from "@tabler/icons-react";
import {Editor} from "@code0-tech/pictor/dist/components/editor/Editor";
import {
    FileTabs,
    FileTabsContent,
    FileTabsList,
    FileTabsTrigger
} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {GanttItem} from "@code0-tech/pictor/dist/components/gantt/GanttItem";
import {FALLBACK_FLOW_TYPE_NAME, FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";
import {FunctionService} from "@edition/function/services/Function.service";
import {ProjectService} from "@edition/project/services/Project.service";
import Link from "next/link";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {icon} from "@core/util/icons";
import {formatDistanceToNow} from "date-fns";

export interface NodeGanttItem extends GanttItem {
    data?: {
        displayMessage: string
        color: string
        payload?: Maybe<NodeFunction> | Maybe<FunctionDefinition> | Maybe<Flow>
        input?: ExecutionParameterResult[] | object
        success?: object
        error?: Maybe<ExecutionError>
    }
}

export const FlowExecutionResultView: React.FC = () => {

    const params = useParams()
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const [activeTab, setActiveTab] = React.useState<string>()

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const flowIndex = params.flowId as any as number
    const flowId: Flow['id'] = `gid://sagittarius/Flow/${flowIndex}`
    const namespaceId: Namespace['id'] = `gid://sagittarius/Namespace/${namespaceIndex}`
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const flow = React.useMemo(
        () => flowService.getById(flowId, {
            namespaceId,
            projectId
        }),
        [flowStore, namespaceId, projectId, flowId]
    )

    const project = React.useMemo(
        () => projectService.getById(projectId, {namespaceId}),
        [projectId, projectStore]
    )

    const flowTypes = React.useMemo(
        () => flowTypeService.values({
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [project, flowTypeStore]
    )

    const functions = React.useMemo(
        () => functionService.values({
            namespaceId,
            projectId,
            runtimeId: project?.primaryRuntime?.id
        }),
        [project, functionStore]
    )

    const flowExecutionResults = React.useMemo(
        () => [...(flow?.executionResults?.nodes ?? [])]?.reverse() ?? [],
        [flow?.executionResults?.nodes]
    )

    const ganttItems = React.useMemo<Map<ExecutionResult['id'], NodeGanttItem[]>>(
        () => {
            return new Map<ExecutionResult["id"], NodeGanttItem[]>(flowExecutionResults.map(result => [result?.id, [
                {
                    id: result?.id as string,
                    type: "trigger",
                    start: 0,
                    end: (result?.finishedAt ?? 0) - (result?.startedAt ?? 0),
                    data: {
                        displayMessage: flowTypes.find(fT => fT.id === flow?.type?.id)?.names?.[0].content ?? FALLBACK_FLOW_TYPE_NAME,
                        color: hashToColor(result?.flow?.name ?? ""),
                        payload: {
                            ...flow,
                            type: flowTypes.find(fT => fT.id === flow?.type?.id)
                        },
                        success: result?.success,
                        input: result?.input,
                        error: result?.error,
                    }
                },
                ...(result?.nodeResults?.nodes?.map?.(nodeResult => {

                    if (nodeResult?.functionDefinition) {
                        const funktion = functions.find(f => f.id === nodeResult?.functionDefinition?.id)

                        return {
                            id: nodeResult?.id as string,
                            type: "function",
                            start: (nodeResult?.startedAt ?? 0) - (result?.startedAt ?? 0),
                            end: (nodeResult?.finishedAt ?? 0) - (result?.startedAt ?? 0),
                            data: {
                                displayMessage: funktion?.names?.[0].content ?? FALLBACK_FUNCTION_NAME,
                                color: hashToColor(funktion?.identifier ?? ""),
                                payload: funktion,
                                success: nodeResult?.success,
                                input: nodeResult?.parameterResults ?? [],
                                error: nodeResult?.error,
                            }
                        }
                    }

                    const node = flow?.nodes?.nodes?.find(n => n?.id === nodeResult?.nodeFunction?.id)
                    const funktion = functions.find(f => f.id === nodeResult?.nodeFunction?.functionDefinition?.id)

                    return {
                        id: nodeResult?.id as string,
                        type: "node",
                        start: (nodeResult?.startedAt ?? 0) - (result?.startedAt ?? 0),
                        end: (nodeResult?.finishedAt ?? 0) - (result?.startedAt ?? 0),
                        data: {
                            displayMessage: funktion?.names?.[0].content ?? FALLBACK_FUNCTION_NAME,
                            color: hashToColor(nodeResult?.nodeFunction?.id ?? ""),
                            payload: {
                                ...node,
                                functionDefinition: funktion
                            },
                            success: nodeResult?.success,
                            input: nodeResult?.parameterResults ?? [],
                            error: nodeResult?.error,
                        }
                    }
                }) ?? [])
            ]]))
        },
        [flowExecutionResults, flowTypes, flow, functions]
    )

    return <>
        <FileTabs
            value={activeTab}
            defaultValue={flowExecutionResults?.[0]?.id ?? undefined}
            onValueChange={(value) => {
                setActiveTab(value)
            }}
        >
            <Layout showLayoutSplitter={false} layoutGap={"0"} topContent={<FileTabsList
                controls={
                    ganttItems.size > 0 ? (
                        <Menu>
                            <MenuTrigger asChild>
                                <Button variant="none" paddingSize={"xxs"} color="primary">
                                    <IconPlus size={12}/>
                                </Button>
                            </MenuTrigger>
                            <MenuPortal>
                                <MenuContent align="start" sideOffset={8}>
                                    {flowExecutionResults.map(result => {
                                        return <MenuItem key={result?.id} onSelect={() => {
                                            setActiveTab(result?.id!)
                                        }}>
                                            <Text size={"sm"}>
                                                {result?.id}
                                            </Text>
                                        </MenuItem>
                                    })}
                                </MenuContent>
                            </MenuPortal>
                        </Menu>
                    ) : null
                }
            >
                {Array.from(ganttItems)?.map(([id, items]) => {

                    const execution = flowExecutionResults.find(execution => execution?.id === id)

                    return <FileTabsTrigger value={id!}
                                            key={id!}>
                        <Flex align={"center"} style={{gap: "0.35rem"}}>
                            <IconPlayerPlayFilled size={13} color={hashToColor(id ?? "")}/>
                            <Text size={"sm"}>
                                #{id?.match(/ExecutionResult\/(\d+)$/)?.[1]}
                            </Text>
                            <Text size={"sm"} hierarchy={"tertiary"}>
                                {formatDistanceToNow(execution?.createdAt ?? "")}
                            </Text>
                        </Flex>
                    </FileTabsTrigger>
                })}
            </FileTabsList>}>
                <>
                    {
                        ganttItems.size > 0 ? Array.from(ganttItems)?.map(([id, items]) => {
                            return <FileTabsContent h={"100%"}
                                                    p={"0"}
                                                    value={id!}
                                                    key={id}>
                                <Gantt step={0.15} stepWidth={"50px"} rowHeight={"50px"} items={items} start={0}>
                                    {(item) => {

                                        if (item.type === "group") {
                                            return <Flex align={"center"} justify={"start"} w={"100%"} h={"100%"}
                                                         style={{cursor: "pointer"}}
                                                         onClick={() => {
                                                             const element = document.getElementById(`group-target-${item.data.displayMessage}`)
                                                             element?.scrollIntoView({behavior: "smooth"})
                                                         }}>
                                                <Card color={"secondary"}
                                                      paddingSize={"xs"}
                                                      p={"0"}
                                                      h={"31px"}
                                                      style={{
                                                          background: "transparent",
                                                          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, ${withAlpha(item.data.color, 0.25)} 4px, ${withAlpha(item.data.color, 0.25)} 4px)`
                                                      }}
                                                      w={"100%"}>
                                                    <></>
                                                </Card>
                                            </Flex>
                                        } else {

                                            const DisplayIcon = icon(
                                                item.type === "node" ? item?.data?.payload?.functionDefinition?.displayIcon : item.type === "function" ? item?.data?.payload?.displayIcon : item?.data?.payload?.type?.displayIcon,
                                            )

                                            return <Tooltip key={item.id}>
                                                <TooltipTrigger asChild>
                                                    <Flex align={"center"} justify={"start"} w={"100%"} h={"100%"}
                                                          style={{cursor: "pointer"}}>
                                                        <Card color={"primary"}
                                                              className={`d-flow-node`}
                                                              paddingSize={"xs"}
                                                              py={"0.35"}
                                                              w={"100%"}>
                                                            <Flex align={"center"} w={"100%"} pos={"relative"}
                                                                  justify={"space-between"}
                                                                  style={{
                                                                      gap: "0.35rem",
                                                                      textWrap: "nowrap",
                                                                      overflow: "hidden"
                                                                  }}>
                                                                <Flex align={"center"} maw={"75%"} pos={"relative"}
                                                                      justify={"start"}
                                                                      style={{gap: "0.7rem"}}>
                                                                    <DisplayIcon size={16}
                                                                                 style={{
                                                                                     minWidth: "16px",
                                                                                     minHeight: "16px",
                                                                                 }}
                                                                                 color={hashToColor(item?.data?.payload?.id ?? "")}/>
                                                                    <Text size={"md"}
                                                                          style={{
                                                                              overflow: "hidden",
                                                                              position: "relative"
                                                                          }}>
                                                                        {item.data.displayMessage}
                                                                    </Text>
                                                                </Flex>
                                                                <Text size={"xs"} hierarchy={"tertiary"}>
                                                                    {getRelativeValue(item.end - item.start)}
                                                                </Text>
                                                            </Flex>
                                                        </Card>
                                                    </Flex>
                                                </TooltipTrigger>
                                                <TooltipPortal>
                                                    <TooltipContent forceMount sideOffset={8} align={"start"}
                                                                    maw={"300px"}>
                                                        <Flex align={"center"} justify={"space-between"}
                                                              style={{gap: "0.7rem"}}>
                                                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                                <DisplayIcon size={16}
                                                                             style={{
                                                                                 minWidth: "16px",
                                                                                 minHeight: "16px",
                                                                             }}
                                                                             color={hashToColor(item?.data?.payload?.id ?? "")}/>
                                                                <Text size={"md"}
                                                                      style={{
                                                                          overflow: "hidden",
                                                                          position: "relative"
                                                                      }}>
                                                                    {item?.data?.displayMessage}
                                                                </Text>
                                                            </Flex>
                                                            <Text size={"sm"} hierarchy={"tertiary"}>
                                                                {getRelativeValue(item.end - item.start)}
                                                            </Text>
                                                        </Flex>
                                                        <Spacing spacing={"xs"}/>

                                                        <>
                                                            <Text size={"md"}>
                                                                {item.type === "node" || item.type === "function" ? "Parameters" : "Input"}
                                                            </Text>
                                                            {item.type === "node" || item.type === "function" ? item.data.input?.map((input: ExecutionParameterResult, index: number) => {

                                                                //TODO: for item.type === function this is wrong
                                                                const parameter: ParameterDefinition = item?.data?.payload?.functionDefinition?.parameterDefinitions?.nodes?.[index]

                                                                return <div key={input.id}>
                                                                    <Text size={"sm"} hierarchy={"tertiary"}>
                                                                        {parameter?.names?.[0]?.content}
                                                                    </Text>
                                                                    <Editor readonly showTooltips={false}
                                                                            language={"json"}
                                                                            initialValue={input.value}
                                                                            customSuggestionComponent={false}
                                                                            basicSetup={{
                                                                                highlightActiveLine: false,
                                                                                highlightActiveLineGutter: false,
                                                                            }}/>
                                                                </div>

                                                            }) : item.type === "trigger" ? (
                                                                <Editor readonly showTooltips={false} language={"json"}
                                                                        initialValue={item.data.input}
                                                                        customSuggestionComponent={false}
                                                                        basicSetup={{
                                                                            highlightActiveLine: false,
                                                                            highlightActiveLineGutter: false,
                                                                        }}/>
                                                            ) : null}
                                                        </>

                                                        <Spacing spacing={"xs"}/>
                                                        {
                                                            item.data.success && (
                                                                <div>
                                                                    <Text size={"md"}>
                                                                        Result
                                                                    </Text>
                                                                    <Editor readonly showTooltips={false} language={"json"}
                                                                            initialValue={item.data.success}
                                                                            basicSetup={{
                                                                                highlightActiveLine: false,
                                                                                highlightActiveLineGutter: false,
                                                                            }}/>
                                                                </div>
                                                            )
                                                        }
                                                    </TooltipContent>
                                                </TooltipPortal>
                                            </Tooltip>
                                        }
                                    }}
                                </Gantt>
                            </FileTabsContent>
                        }) : (
                            <Flex align={"center"} justify={"center"} h={"100%"}
                                  style={{textAlign: "center", flexDirection: "column"}}>
                                <Flex align={"center"} justify={"center"}
                                      style={{textAlign: "center", flexDirection: "column"}}>
                                    <Text size={"lg"} hierarchy={"primary"}>
                                        No execution results available
                                    </Text>
                                    <Spacing spacing={"xl"}/>
                                    <Text>
                                        To see the execution results, you need to execute the flow at least once. <br/>
                                        Once you have execution results, they will be displayed here in a Gantt chart.
                                    </Text>
                                    <Spacing spacing={"xl"}/>
                                    <ButtonGroup>
                                        <Link href={"https://docs.codezero.build/"}>
                                            <Button paddingSize={"xxs"} color={"tertiary"} variant={"none"}>
                                                Learn how to execute flows
                                            </Button>
                                        </Link>
                                        <Button paddingSize={"xxs"} color={"tertiary"} variant={"none"} disabled>
                                            Manually execute flow
                                        </Button>
                                    </ButtonGroup>
                                </Flex>
                            </Flex>
                        )
                    }
                </>
            </Layout>

        </FileTabs>
    </>

}