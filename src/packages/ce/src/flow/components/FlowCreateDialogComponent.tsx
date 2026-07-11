import React, {startTransition} from "react";
import {FlowType, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {IconArrowsUpDown, IconCornerDownLeft, IconSearch, IconX} from "@tabler/icons-react";
import {
    Badge,
    Button,
    Card,
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    hashToColor,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Spacing,
    Text,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {Tab, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ModuleService} from "@edition/module/services/Module.service";
import {FlowNameInputComponent} from "@edition/flow/components/FlowNameInputComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {useParams} from "next/navigation";
import {ProjectService} from "@edition/project/services/Project.service";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import Link from "next/link";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FLOW_TYPE_NAME} from "@core/util/fallback-translations";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

export interface FlowCreateDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    flowTypeId?: FlowType['id']
}

interface FlowTypeGroup {
    flowTypes: FlowType[]
    displayMessage?: string
    icon?: string
}

export const FlowCreateDialogComponent: React.FC<FlowCreateDialogComponentProps> = (props) => {

    const {open, onOpenChange, flowTypeId} = props

    const params = useParams()
    const flowService = useService(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const [step, setStep] = React.useState<"type" | "name">(flowTypeId ? "name" : "type")
    const [selectedFlowTypeId, setSelectedFlowTypeId] = React.useState<FlowType['id'] | undefined>(flowTypeId)
    const [currentTab, setCurrentTab] = React.useState<string>("group-0")
    const [holdCurrentTab, setHoldCurrentTab] = React.useState<string>("group-0")

    const selectedFlowType = React.useMemo(() => {
        return flowTypeService.getById(selectedFlowTypeId)
    }, [selectedFlowTypeId, flowTypeStore])

    const initialValues = React.useMemo(
        () => ({name: null}),
        []
    )

    const project = React.useMemo(
        () => projectService.getById(projectId),
        [projectStore, projectId]
    )

    const primaryRuntime = React.useMemo(
        () => [...runtimeService.values(), ...runtimeService.values({namespaceId: project?.namespace?.id})].find(runtime => runtime.id == project?.primaryRuntime?.id),
        [project, runtimeStore]
    )

    const flowTypes = React.useMemo(
        () => flowTypeService.values({
            runtimeId: primaryRuntime?.id,
            projectId: projectId,
            namespaceId: project?.namespace?.id
        }),
        [flowTypeStore]
    )

    const modules = React.useMemo(
        () => moduleService.values(),
        [moduleService, moduleStore]
    )

    const flowTypeGroups: FlowTypeGroup[] = React.useMemo(() => {
        const groupedByModule = new Map<string, { flowTypes: FlowType[], module: any }>()

        flowTypes.forEach((flowType) => {
            const moduleId = flowType.runtimeModule?.id ?? ""
            const module = modules.find(m => m.id === moduleId)

            if (!groupedByModule.has(moduleId)) {
                groupedByModule.set(moduleId, {
                    flowTypes: [],
                    module: module
                })
            }

            groupedByModule.get(moduleId)!.flowTypes.push(flowType)
        })

        return [
            {
                flowTypes: flowTypes,
                displayMessage: "All",
                icon: undefined
            },
            ...Array.from(groupedByModule.values()).map((group) => ({
                flowTypes: group.flowTypes,
                displayMessage: group.module?.names?.[0]?.content,
                icon: group.module?.icon
            }))
        ]
    }, [flowTypes, modules])

    const createFlow = React.useCallback((name: string, type: FlowType['id']) => {
        if (!type) return
        startTransition(() => {
            flowService.flowCreate({
                // @ts-ignore
                flow: {
                    settings: selectedFlowType?.flowTypeSettings?.nodes?.map(setting => ({
                        value: setting?.defaultValue !== null && setting?.defaultValue !== undefined ? setting?.defaultValue : null,
                    })) ?? [],
                    name: name,
                    type: type,
                    nodes: [],
                },
                projectId: projectId
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    addIslandSuccessNotification({
                        message: "Created flow"
                    })

                }
            })
        })
    }, [flowService, selectedFlowType])

    React.useEffect(() => {
        if (open) {
            setSelectedFlowTypeId(flowTypeId)
            setStep(flowTypeId ? "name" : "type")
            setCurrentTab("group-0")
            setHoldCurrentTab("group-0")
        }
    }, [open, flowTypeId])

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            }
        },
        onSubmit: (values) => {
            createFlow?.(values.name!, selectedFlowTypeId!)
            onOpenChange?.(false)
        }
    })

    const SelectedFlowTypeDisplayIcon = icon(selectedFlowType?.displayIcon as IconString)

    if (!primaryRuntime || flowTypes.length <= 0) {
        return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
            <DialogPortal>
                <DialogOverlay/>
                <DialogContent autoFocus showCloseButton
                               title={!primaryRuntime ? "Missing primary runtime" : "No triggers available"}>
                    <Spacing spacing={"xl"}/>
                    {!primaryRuntime ? (
                        <Text size={"md"}>
                            You don't have a primary runtime yet, assign and/or create a runtime to be able to create
                            flows.
                        </Text>
                    ) : (
                        <Text size={"md"}>
                            Their is no trigger available for the primary runtime, assign and/or create another
                            runtime to be able to create flows.
                        </Text>
                    )}
                    <Spacing spacing={"xl"}/>
                    <Flex justify={"space-between"} align={"center"}>
                        <DialogClose asChild>
                            <Button color={"tertiary"}>No, go back!</Button>
                        </DialogClose>
                        <ButtonGroup color={"tertiary"}>
                            <Link href={`/namespace/${namespaceIndex}/project/${projectIndex}/runtime`}>
                                <Button color={"info"} variant={"none"}>
                                    <Text>Assign</Text>
                                </Button>
                            </Link>
                            <Link href={`/namespace/${namespaceIndex}/runtimes/create`}>
                                <Button color={"success"} variant={"none"}>
                                    <Text>Create</Text>
                                </Button>
                            </Link>
                        </ButtonGroup>
                    </Flex>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    }

    if (step === "type") {
        // @ts-ignore
        return <CommandDialog p={"0"} open={open} onOpenChange={(open) => onOpenChange?.(open)}
                              contentProps={{h: "75vh", w: "50%"}}>

            <Layout layoutGap={0} showLayoutSplitter={false}
                    bottomContent={<div style={{padding: "0.7rem"}}>
                        <Flex style={{gap: "0.7rem"}} justify={"space-between"} align={"center"}>
                            <Flex style={{gap: "0.35rem"}} align={"center"}>
                                <Badge><IconArrowsUpDown size={13}/></Badge>
                                <Text>to navigate and</Text>
                                <Badge><IconCornerDownLeft size={13}/></Badge>
                                <Text>to select a trigger</Text>
                            </Flex>
                            <Flex style={{gap: "0.35rem"}} align={"center"}>
                                <Badge>ESC</Badge>
                                <Text>to close this dialog</Text>
                            </Flex>
                        </Flex>
                    </div>}
                    topContent={<div style={{padding: "0.35rem 0.7rem"}}><CommandInput onChange={(event) => {
                        if (event.target.value == "") {
                            setCurrentTab(holdCurrentTab)
                        } else {
                            if (currentTab != "group-0") setHoldCurrentTab(currentTab)
                            if (currentTab != "group-0") setCurrentTab("group-0")
                        }
                    }} left={<IconSearch size={13}/>} placeholder="Search for triggers..."/>
                    </div>}>
                <Card m={0.1} h={"100%"} paddingSize={"md"}>
                    <Tab h={"100%"} orientation={"vertical"} value={currentTab}
                         onValueChange={(value) => {
                             setCurrentTab(value)
                             setHoldCurrentTab(value)
                         }}>
                        <Layout style={{overflow: "hidden"}}
                                layoutGap={"1rem"}
                                leftContent={<ScrollArea h={"100%"} type={"always"} miw={"150px"}>
                                    <ScrollAreaViewport h={"100%"} w={"100%"}>
                                        <TabList>
                                            {flowTypeGroups.map((group, index) => {

                                                const DisplayIcon = icon(group.icon as IconString)

                                                return <TabTrigger value={`group-${index}`} asChild>
                                                    <Button w={"100%"} justify={"start"} paddingSize={"xxs"}
                                                            variant={"none"}>
                                                        <DisplayIcon color={hashToColor(`group-${index}`)} size={16}/>
                                                        <Text size={"sm"}>{group.displayMessage}</Text>
                                                    </Button>
                                                </TabTrigger>
                                            })}
                                        </TabList>
                                    </ScrollAreaViewport>
                                    <ScrollAreaScrollbar orientation={"vertical"}>
                                        <ScrollAreaThumb/>
                                    </ScrollAreaScrollbar>
                                </ScrollArea>}>
                            <ScrollArea h={"100%"} w={"100%"} type={"always"}>
                                <ScrollAreaViewport style={{minWidth: "auto"}}>
                                    <CommandList w={"100%"}>
                                        <CommandEmpty>No results found.</CommandEmpty>
                                        {flowTypeGroups.map((group, index) => {
                                            return currentTab === `group-${index}` && <>
                                                {group.flowTypes.map((flowType, flowTypeIndex) => {

                                                    const DisplayIcon = icon(flowType.displayIcon as IconString)

                                                    return <>
                                                        <CommandItem
                                                            data-qa-selector={"flow-create-trigger-select-item"}
                                                            keywords={[...(flowType.aliases?.[0]?.content ?? "").split(";"), flowType.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_NAME]}
                                                            display={"block"}
                                                            my={0.7}
                                                            style={{boxSizing: "border-box", overflow: "hidden"}}
                                                            value={flowTypeIndex.toString()} onSelect={() => {
                                                            setSelectedFlowTypeId(flowType.id)
                                                            setStep("name")
                                                        }}>
                                                            <Flex style={{gap: "0.35rem"}} align={"center"}>
                                                                <DisplayIcon color={hashToColor(`group-${index}`)}
                                                                             size={16}/>
                                                                <Text
                                                                    size={"sm"}>{flowType.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_NAME}</Text>
                                                            </Flex>
                                                            <Spacing spacing={"xxs"}/>
                                                            <Text hierarchy={"tertiary"}
                                                                  size={"sm"}>{flowType.descriptions?.[0]?.content}</Text>
                                                        </CommandItem>
                                                        <CommandSeparator/>
                                                    </>
                                                })}
                                            </>
                                        })}
                                    </CommandList>
                                </ScrollAreaViewport>
                                <ScrollAreaScrollbar orientation={"vertical"}>
                                    <ScrollAreaThumb/>
                                </ScrollAreaScrollbar>
                            </ScrollArea>
                        </Layout>
                    </Tab>
                </Card>
            </Layout>
        </CommandDialog>
    }

    return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent autoFocus>
                <Flex align={"center"} justify={"space-between"}>
                    <Flex align={"center"} style={{gap: "0.35rem"}}>
                        <Badge color={"tertiary"}>
                            {selectedFlowTypeId ?
                                <SelectedFlowTypeDisplayIcon size={13}
                                                             color={hashToColor(selectedFlowTypeId)}/> : null}
                            <Text size={"sm"} hierarchy={"primary"}>
                                {selectedFlowType?.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_NAME}
                            </Text>
                        </Badge>
                        <Text hierarchy={"primary"} size={"md"}>/ Create new flow</Text>
                    </Flex>
                    <DialogClose asChild>
                        <Button color={"tertiary"} variant={"none"}>
                            <IconX size={16}/>
                        </Button>
                    </DialogClose>
                </Flex>
                <Spacing spacing={"xl"}/>
                <FlowNameInputComponent
                    data-qa-selector={"flow-create-name"}
                    description={"You can choose a name here and only use alphanumeric names."}
                    title={"Name of the flow"}
                    {...inputs.getInputProps("name")}/>
                <Spacing spacing={"xl"}/>
                <Flex justify={"space-between"} align={"center"}>
                    {flowTypeId ? (
                        <DialogClose asChild>
                            <Button color={"tertiary"} variant={"filled"}>No, go back!</Button>
                        </DialogClose>
                    ) : (
                        <Button color={"tertiary"}
                                onClick={() => setStep("type")}>No, go back!</Button>
                    )}
                    <Button data-qa-selector={"flow-create-send"} color={"success"}
                            onClick={validate}>Yes, create!</Button>
                </Flex>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
