import React, {startTransition} from "react";
import {FlowType, NamespaceProject} from "@code0-tech/sagittarius-graphql-types";
import {IconArrowDown, IconArrowUp, IconCornerDownLeft} from "@tabler/icons-react";
import {
    Badge,
    Button,
    Card,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    hashToColor,
    InputDescription,
    InputLabel,
    InputMessage,
    Menu,
    MenuContent,
    MenuItem,
    MenuLabel,
    MenuPortal,
    MenuTrigger,
    Spacing,
    Text,
    toast,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {FlowNameInputComponent} from "@edition/flow/components/FlowNameInputComponent";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {useParams} from "next/navigation";
import {ProjectService} from "@edition/project/services/Project.service";
import {RuntimeService} from "@edition/runtime/services/Runtime.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import Link from "next/link";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FLOW_TYPE_NAME} from "@core/util/fallback-translations";

export interface FlowCreateDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    flowTypeId?: FlowType['id']
}

export const FlowCreateDialogComponent: React.FC<FlowCreateDialogComponentProps> = (props) => {

    const {open, onOpenChange, flowTypeId} = props

    const params = useParams()
    const flowService = useService(FlowService)
    const flowTypeService = useService(FlowTypeService)
    const flowTypeStore = useStore(FlowTypeService)
    const projectService = useService(ProjectService)
    const projectStore = useStore(ProjectService)
    const runtimeService = useService(RuntimeService)
    const runtimeStore = useStore(RuntimeService)

    const namespaceIndex = params.namespaceId as any as number
    const projectIndex = params.projectId as any as number
    const projectId: NamespaceProject['id'] = `gid://sagittarius/NamespaceProject/${projectIndex}`

    const [createDialogOpen, setCreateDialogOpen] = React.useState(open)
    const [selectedFlowTypeId, setSelectedFlowTypeId] = React.useState<FlowType['id'] | undefined>(flowTypeId)

    const selectedFlowType = React.useMemo(() => {
        return flowTypeService.getById(selectedFlowTypeId)
    }, [selectedFlowTypeId, flowTypeStore])

    const initialValues = React.useMemo(
        () => ({name: null, flowTypeId: flowTypeId ?? null}),
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

    const createFlow = React.useCallback((name: string, type: FlowType['id']) => {
        if (!type) return
        startTransition(() => {
            flowService.flowCreate({
                // @ts-ignore
                flow: {
                    settings: [],
                    name: name,
                    type: type,
                    nodes: [],
                },
                projectId: projectId
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) <= 0) {
                    toast({
                        title: "The flow was successfully created.",
                        color: "success",
                        dismissible: true,
                    })

                }
            })
        })
    }, [flowService])

    React.useEffect(() => {
        setCreateDialogOpen(open)
    }, [open])

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {
            name: (value) => {
                if (!value) return "Name is required"
                return null
            },
            flowTypeId: (value) => {
                if (!value) return "Trigger is required"
                return null
            }
        },
        onSubmit: (values) => {
            createFlow?.(values.name!, values.flowTypeId)
            onOpenChange?.(false)
        }
    })

    const SelectedFlowTypeDisplayIcon = icon(flowTypes.find(flowType => flowType.id == selectedFlowTypeId)?.displayIcon as IconString)

    return <Dialog open={createDialogOpen} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent autoFocus showCloseButton
                           title={!primaryRuntime ? "Missing primary runtime" : flowTypes.length <= 0 ? "No triggers available" : "Create new flow"}>
                <Spacing spacing={"xl"}/>
                {!primaryRuntime ? <>
                    <Text size={"md"}>
                        You don't have a primary runtime yet, assign and/or create a runtime to be able to create flows.
                    </Text>
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
                </> : flowTypes.length <= 0 ? (
                    <>
                        <Spacing spacing={"xl"}/>
                        <Text size={"md"}>
                            Their is no trigger available for the primary runtime, assign and/or create another
                            runtime to be able to create flows.
                        </Text>
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
                    </>
                ) : (
                    <>
                        <InputLabel>Trigger</InputLabel>
                        <InputDescription>You can choose a trigger here</InputDescription>
                        <Menu>
                            <MenuTrigger asChild>
                                <Button data-qa-selector={"flow-create-trigger-select"}
                                        w={"100%"}
                                        color={inputs.getInputProps("flowTypeId").formValidation?.valid ? "tertiary" : "error"}
                                        style={{justifyContent: "start"}}>
                                    {selectedFlowTypeId ?
                                        <SelectedFlowTypeDisplayIcon size={12}
                                                                     color={hashToColor(selectedFlowTypeId)}/> : null}
                                    {selectedFlowType ? selectedFlowType?.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_NAME : "Select trigger"}
                                </Button>
                            </MenuTrigger>
                            <MenuPortal>
                                <MenuContent align={"start"}
                                             color={"secondary"}
                                             sideOffset={8}>
                                    <Card paddingSize={"xxs"} mt={-0.2} mx={-0.2}>
                                        {flowTypes.map((flowType) => {

                                            const DisplayIcon = icon(flowType?.displayIcon as IconString)

                                            return <MenuItem data-qa-selector={"flow-create-trigger-select-item"} key={flowType.id} onSelect={() => {
                                                inputs.getInputProps("flowTypeId").formValidation?.setValue(flowType.id)
                                                setSelectedFlowTypeId(flowType.id)
                                            }}>
                                                <DisplayIcon size={16}/>
                                                {flowType.names?.[0]?.content ?? FALLBACK_FLOW_TYPE_NAME}
                                            </MenuItem>
                                        })}
                                    </Card>
                                    <MenuLabel>
                                        <Flex style={{gap: ".35rem"}}>
                                            <Flex align={"center"} style={{gap: "0.35rem"}}>
                                                <Flex>
                                                    <Badge border><IconArrowUp size={12}/></Badge>
                                                    <Badge border><IconArrowDown size={12}/></Badge>
                                                </Flex>
                                                move
                                            </Flex>
                                            <Spacing spacing={"xxs"}/>
                                            <Flex align={"center"} style={{gap: ".35rem"}}>
                                                <Badge border><IconCornerDownLeft size={12}/></Badge>
                                                select
                                            </Flex>
                                        </Flex>
                                    </MenuLabel>
                                </MenuContent>
                            </MenuPortal>
                        </Menu>
                        {!inputs.getInputProps("flowTypeId").formValidation?.valid ?
                            <InputMessage>{inputs.getInputProps("flowTypeId").formValidation?.notValidMessage!}</InputMessage> : null}
                        <Spacing spacing={"md"}/>
                        <FlowNameInputComponent
                            data-qa-selector={"flow-create-name"}
                            description={"You can choose a name here and only use alphanumeric names."}
                            title={"Name of the flow"}
                            {...inputs.getInputProps("name")}/>
                        <Spacing spacing={"xl"}/>
                        <Flex justify={"space-between"} align={"center"}>
                            <DialogClose asChild>
                                <Button color={"tertiary"} variant={"filled"}>No, go back!</Button>
                            </DialogClose>
                            <Button data-qa-selector={"flow-create-send"} color={"success"} variant={"filled"} onClick={validate}>Yes, create!</Button>
                        </Flex>
                    </>
                )}
            </DialogContent>
        </DialogPortal>
    </Dialog>
}