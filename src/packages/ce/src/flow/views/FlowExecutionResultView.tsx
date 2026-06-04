import React from "react";
import {useParams} from "next/navigation";
import {
    Flow,
    FunctionDefinition,
    Namespace,
    NamespaceProject,
    NodeFunction
} from "@code0-tech/sagittarius-graphql-types";
import {
    Button,
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
import {
    IconArrowRampRight2,
    IconBrandDiscord,
    IconBrandTeams,
    IconDatabase,
    IconPlayerPlayFilled,
    IconPlus,
    IconTextGrammar
} from "@tabler/icons-react";
import {Editor} from "@code0-tech/pictor/dist/components/editor/Editor";
import {
    FileTabs,
    FileTabsContent,
    FileTabsList,
    FileTabsTrigger
} from "@code0-tech/pictor/dist/components/file-tabs/FileTabs";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {formatDistanceToNow} from "date-fns";
import {GanttItem} from "@code0-tech/pictor/dist/components/gantt/GanttItem";

export interface NodeGanttItem extends GanttItem {
    data?: {
        displayMessage: string
        color: string
        node: NodeFunction
        function: FunctionDefinition
    }
}

export const FlowExecutionResultView: React.FC = () => {

    const params = useParams()
    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
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

    const flowExecutionResults = React.useMemo(
        () => flow?.executionResults?.nodes ?? [],
        [flow]
    )

    const activeFlowExecutionResult = React.useMemo(
        () => flowExecutionResults.find?.(result => result?.id === activeTab),
        [flowExecutionResults, activeTab]
    )

    const ganttItems = React.useMemo<NodeGanttItem[]>(
        () => {
            return [
                {
                    id: activeFlowExecutionResult?.id as string,
                    start: 0,
                    end: 0
                }
            ]
        },
        []
    )

    return <>
        <FileTabs
            value={activeTab}
            onValueChange={(value) => {
                setActiveTab(value)
            }}
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
                }
            >
                <FileTabsTrigger value={"test"}
                                 key={"test"}>
                    <IconPlayerPlayFilled color={hashToColor("test")} size={13}/>
                    <Text size={"sm"}>
                        #1
                    </Text>
                    <Text size={"sm"} hierarchy={"tertiary"}>
                        {formatDistanceToNow("Thu Jun 04 2026 17:56:20 GMT+0000")} ago
                    </Text>
                </FileTabsTrigger>
                {flowExecutionResults.map(result => {
                    return <FileTabsTrigger value={result?.id!}
                                            key={result?.id!}>
                        <Text size={"sm"}>
                            {result?.id}
                        </Text>
                    </FileTabsTrigger>
                })}
            </FileTabsList>}>
                <>
                    <FileTabsContent h={"100%"}
                                     p={"0"}
                                     value={"test"}
                                     key={"test"}>
                        <Gantt step={0.15} stepWidth={"50px"} rowHeight={"50px"} items={[
                            {
                                id: "0",
                                start: 0,
                                end: 190_000,
                                data: {
                                    icon: IconBrandDiscord,
                                    displayMessage: "On Discord channel message send"
                                }
                            },
                            {
                                id: "1",
                                start: 0,
                                end: 200,
                                data: {
                                    icon: IconTextGrammar,
                                    displayMessage: "Contains sensitive words?"
                                }
                            },
                            {
                                id: "2",
                                start: 199,
                                end: 300,
                                data: {
                                    icon: IconArrowRampRight2,
                                    displayMessage: "If"
                                }
                            },
                            {
                                id: "2",
                                start: 199,
                                end: 300,
                                data: {
                                    icon: IconArrowRampRight2,
                                    displayMessage: "If"
                                }
                            },
                            {
                                id: "2",
                                start: 199,
                                end: 300,
                                data: {
                                    icon: IconArrowRampRight2,
                                    displayMessage: "If"
                                }
                            },
                            {
                                id: "2",
                                start: 199,
                                end: 300,
                                data: {
                                    icon: IconArrowRampRight2,
                                    displayMessage: "If"
                                }
                            },
                            {
                                id: "2",
                                start: 199,
                                end: 300,
                                data: {
                                    icon: IconArrowRampRight2,
                                    displayMessage: "If"
                                }
                            },
                            {
                                id: "2",
                                start: 199,
                                end: 300,
                                data: {
                                    icon: IconArrowRampRight2,
                                    displayMessage: "If"
                                }
                            },
                            {
                                id: "2",
                                start: 199,
                                end: 300,
                                data: {
                                    icon: IconArrowRampRight2,
                                    displayMessage: "If"
                                }
                            },
                            {
                                id: "3",
                                start: 300,
                                end: 50_000,
                                data: {
                                    icon: IconBrandDiscord,
                                    displayMessage: "Ban user"
                                }
                            },
                            {
                                id: "4",
                                start: 49_000,
                                end: 110_000,
                                data: {
                                    icon: IconBrandDiscord,
                                    displayMessage: "Send ban message in channel",
                                    parameters: [{
                                        name: "Message content",
                                        value: "The user @test_user has been banned for sending a message containing sensitive words.",
                                    }],
                                    result: {
                                        http_status_code: 204,
                                        payload: {},
                                        headers: {}
                                    }
                                }
                            },
                            {
                                id: "5",
                                start: 110_000,
                                end: 130_000,
                                data: {
                                    icon: IconDatabase,
                                    displayMessage: "Save ban in own database"
                                }
                            },
                            {
                                id: "6",
                                start: 110_000,
                                end: 190_000,
                                data: {
                                    icon: IconBrandTeams,
                                    displayMessage: "Notify team members"
                                }
                            }
                        ]} start={0}>
                            {(item) => item.type === "group" ? (
                                <Flex align={"center"} justify={"start"} w={"100%"} h={"100%"}
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
                            ) : (
                                <Tooltip key={item.id}>
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
                                                        {item.data.icon && React.createElement(item.data.icon, {
                                                            color: hashToColor(item.id),
                                                            size: 16,
                                                            style: {minWidth: "13px", minHeight: "13px"}
                                                        })}
                                                        <Text size={"md"}
                                                              style={{overflow: "hidden", position: "relative"}}>
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
                                            <Flex align={"start"} pos={"relative"} justify={"start"}
                                                  style={{gap: "0.35rem"}}>
                                                {item.data.icon && React.createElement(item.data.icon, {
                                                    color: hashToColor(item.id),
                                                    size: 16,
                                                    style: {minWidth: "16px", minHeight: "16px", marginTop: "2px"}
                                                })}
                                                <Text size={"md"}
                                                      style={{overflow: "hidden", position: "relative"}}>
                                                    {item.data.displayMessage}
                                                </Text>
                                            </Flex>
                                            <Spacing spacing={"xs"}/>
                                            <table style={{width: '100%'}}>
                                                <tbody>
                                                <tr>
                                                    <td>
                                                        <Text size={"md"} hierarchy={"tertiary"}>
                                                            Start time
                                                        </Text>
                                                    </td>
                                                    <td style={{width: "1px"}}>
                                                        <Text size={"sm"} hierarchy={"tertiary"}>
                                                            {getRelativeValue(item.start)}
                                                        </Text>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Text size={"md"} hierarchy={"tertiary"}>
                                                            End time
                                                        </Text>
                                                    </td>
                                                    <td style={{width: "1px"}}>
                                                        <Text size={"sm"} hierarchy={"tertiary"}>
                                                            {getRelativeValue(item.end)}
                                                        </Text>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Text size={"md"} hierarchy={"tertiary"}>
                                                            Duration
                                                        </Text>
                                                    </td>
                                                    <td style={{width: "1px"}}>
                                                        <Text size={"sm"} hierarchy={"tertiary"}>
                                                            {getRelativeValue(item.end - item.start)}
                                                        </Text>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <Spacing spacing={"xs"}/>

                                            <>
                                                <Text size={"md"}>
                                                    Parameters
                                                </Text>
                                                {item.data.parameters?.map((item: any, index: number) => (
                                                    <div key={item.name}>
                                                        <Text size={"sm"} hierarchy={"tertiary"}>
                                                            {item.name}
                                                        </Text>
                                                        <Editor readonly showTooltips={false} language={"json"}
                                                                initialValue={item.value}
                                                                basicSetup={{
                                                                    highlightActiveLine: false,
                                                                    highlightActiveLineGutter: false,
                                                                }}/>
                                                    </div>
                                                ))}
                                            </>

                                            <Spacing spacing={"xs"}/>
                                            {
                                                item.data.result && (
                                                    <div>
                                                        <Text size={"md"}>
                                                            Result
                                                        </Text>
                                                        <Editor readonly showTooltips={false} language={"json"}
                                                                initialValue={item.data.result}
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
                            )}
                        </Gantt>
                    </FileTabsContent>
                    {flowExecutionResults.map(result => {
                        return <FileTabsContent h={"100%"}
                                                p={"0"}
                                                value={result?.id!}
                                                key={result?.id!}>
                            <Gantt step={0.15} stepWidth={"50px"} rowHeight={"50px"} items={[
                                {
                                    id: "0",
                                    start: 0,
                                    end: 190_000,
                                    data: {
                                        icon: IconBrandDiscord,
                                        displayMessage: "On Discord channel message send"
                                    }
                                },
                                {
                                    id: "1",
                                    start: 0,
                                    end: 200,
                                    data: {
                                        icon: IconTextGrammar,
                                        displayMessage: "Contains sensitive words?"
                                    }
                                },
                                {
                                    id: "2",
                                    start: 199,
                                    end: 300,
                                    data: {
                                        icon: IconArrowRampRight2,
                                        displayMessage: "If"
                                    }
                                },
                                {
                                    id: "2",
                                    start: 199,
                                    end: 300,
                                    data: {
                                        icon: IconArrowRampRight2,
                                        displayMessage: "If"
                                    }
                                },
                                {
                                    id: "2",
                                    start: 199,
                                    end: 300,
                                    data: {
                                        icon: IconArrowRampRight2,
                                        displayMessage: "If"
                                    }
                                },
                                {
                                    id: "2",
                                    start: 199,
                                    end: 300,
                                    data: {
                                        icon: IconArrowRampRight2,
                                        displayMessage: "If"
                                    }
                                },
                                {
                                    id: "2",
                                    start: 199,
                                    end: 300,
                                    data: {
                                        icon: IconArrowRampRight2,
                                        displayMessage: "If"
                                    }
                                },
                                {
                                    id: "2",
                                    start: 199,
                                    end: 300,
                                    data: {
                                        icon: IconArrowRampRight2,
                                        displayMessage: "If"
                                    }
                                },
                                {
                                    id: "2",
                                    start: 199,
                                    end: 300,
                                    data: {
                                        icon: IconArrowRampRight2,
                                        displayMessage: "If"
                                    }
                                },
                                {
                                    id: "3",
                                    start: 300,
                                    end: 50_000,
                                    data: {
                                        icon: IconBrandDiscord,
                                        displayMessage: "Ban user"
                                    }
                                },
                                {
                                    id: "4",
                                    start: 49_000,
                                    end: 110_000,
                                    data: {
                                        icon: IconBrandDiscord,
                                        displayMessage: "Send ban message in channel",
                                        parameters: [{
                                            name: "Message content",
                                            value: "The user @test_user has been banned for sending a message containing sensitive words.",
                                        }],
                                        result: {
                                            http_status_code: 204,
                                            payload: {},
                                            headers: {}
                                        }
                                    }
                                },
                                {
                                    id: "5",
                                    start: 110_000,
                                    end: 130_000,
                                    data: {
                                        icon: IconDatabase,
                                        displayMessage: "Save ban in own database"
                                    }
                                },
                                {
                                    id: "6",
                                    start: 110_000,
                                    end: 190_000,
                                    data: {
                                        icon: IconBrandTeams,
                                        displayMessage: "Notify team members"
                                    }
                                }
                            ]} start={0}>
                                {(item) => item.type === "group" ? (
                                    <Flex align={"center"} justify={"start"} w={"100%"} h={"100%"}
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
                                ) : (
                                    <Tooltip key={item.id}>
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
                                                            {item.data.icon && React.createElement(item.data.icon, {
                                                                color: hashToColor(item.id),
                                                                size: 16,
                                                                style: {minWidth: "13px", minHeight: "13px"}
                                                            })}
                                                            <Text size={"md"}
                                                                  style={{overflow: "hidden", position: "relative"}}>
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
                                                <Flex align={"start"} pos={"relative"} justify={"start"}
                                                      style={{gap: "0.35rem"}}>
                                                    {item.data.icon && React.createElement(item.data.icon, {
                                                        color: hashToColor(item.id),
                                                        size: 16,
                                                        style: {minWidth: "16px", minHeight: "16px", marginTop: "2px"}
                                                    })}
                                                    <Text size={"md"}
                                                          style={{overflow: "hidden", position: "relative"}}>
                                                        {item.data.displayMessage}
                                                    </Text>
                                                </Flex>
                                                <Spacing spacing={"xs"}/>
                                                <table style={{width: '100%'}}>
                                                    <tbody>
                                                    <tr>
                                                        <td>
                                                            <Text size={"md"} hierarchy={"tertiary"}>
                                                                Start time
                                                            </Text>
                                                        </td>
                                                        <td style={{width: "1px"}}>
                                                            <Text size={"sm"} hierarchy={"tertiary"}>
                                                                {getRelativeValue(item.start)}
                                                            </Text>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <Text size={"md"} hierarchy={"tertiary"}>
                                                                End time
                                                            </Text>
                                                        </td>
                                                        <td style={{width: "1px"}}>
                                                            <Text size={"sm"} hierarchy={"tertiary"}>
                                                                {getRelativeValue(item.end)}
                                                            </Text>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <Text size={"md"} hierarchy={"tertiary"}>
                                                                Duration
                                                            </Text>
                                                        </td>
                                                        <td style={{width: "1px"}}>
                                                            <Text size={"sm"} hierarchy={"tertiary"}>
                                                                {getRelativeValue(item.end - item.start)}
                                                            </Text>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                                <Spacing spacing={"xs"}/>

                                                <>
                                                    <Text size={"md"}>
                                                        Parameters
                                                    </Text>
                                                    {item.data.parameters?.map((item: any, index: number) => (
                                                        <div key={item.name}>
                                                            <Text size={"sm"} hierarchy={"tertiary"}>
                                                                {item.name}
                                                            </Text>
                                                            <Editor readonly showTooltips={false} language={"json"}
                                                                    initialValue={item.value}
                                                                    basicSetup={{
                                                                        highlightActiveLine: false,
                                                                        highlightActiveLineGutter: false,
                                                                    }}/>
                                                        </div>
                                                    ))}
                                                </>

                                                <Spacing spacing={"xs"}/>
                                                {
                                                    item.data.result && (
                                                        <div>
                                                            <Text size={"md"}>
                                                                Result
                                                            </Text>
                                                            <Editor readonly showTooltips={false} language={"json"}
                                                                    initialValue={item.data.result}
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
                                )}
                            </Gantt>
                        </FileTabsContent>
                    })}
                </>
            </Layout>

        </FileTabs>
    </>

}