import React from "react"
import {DataTypeJSONInputTreeComponent} from "./DataTypeJSONInputTreeComponent";
import {Flow, LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {Schema} from "@code0-tech/triangulum";
import {EditableJSONEntry} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";
import {
    DataTypeJSONInputFormComponent
} from "@edition/datatype/components/inputs/json/DataTypeJSONInputFormComponent";
import {
    DataTypeJSONInputBreadcrumbComponent
} from "@edition/datatype/components/inputs/json/DataTypeJSONInputBreadcrumbComponent";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {useSchemaAction} from "@edition/flow/components/FlowWorkerProvider";
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    getSize,
    ScrollArea,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
    Text,
    Tooltip,
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipTrigger,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconArrowsMaximize, IconArrowsMinimize, IconCircleDot, IconX} from "@tabler/icons-react";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";

export interface DataTypeJSONInputEditDialogComponentProps {
    open: boolean
    entry: EditableJSONEntry | undefined
    value: LiteralValue | null
    schema: Schema | undefined
    flowId?: Flow['id']
    nodeId?: NodeFunction['id']
    parameterIndex?: number
    onOpenChange?: (open: boolean) => void
    onObjectChange?: (object: LiteralValue | null) => void
    onObjectClose?: (object: LiteralValue | null) => void
}

export const DataTypeJSONInputEditDialogComponent: React.FC<DataTypeJSONInputEditDialogComponentProps> = (props) => {
    const {
        open,
        entry,
        value,
        schema,
        flowId,
        nodeId,
        parameterIndex,
        onObjectChange,
        onObjectClose,
        onOpenChange
    } = props

    const [editOpen, setEditOpen] = React.useState(open)
    const [collapsedState, setCollapsedStateRaw] = React.useState<Record<string, boolean>>({})
    const [activePath, setActivePath] = React.useState(entry?.path ?? [])
    const [editedObject, setEditedObject] = React.useState<LiteralValue | null>(value)
    const [liveSchema, setLiveSchema] = React.useState<Schema | undefined>(undefined)
    const clickTimeout = React.useRef<NodeJS.Timeout | null>(null)
    const latestSchemaRequest = React.useRef(0)

    const flowService = useService(FlowService)
    const functionService = useService(FunctionService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const functionStore = useStore(FunctionService)
    const {execute} = useSchemaAction()

    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore])
    const functions = React.useMemo(() => functionService.values(), [functionStore])

    React.useEffect(() => {
        if (flowId === undefined || parameterIndex === undefined || dataTypes.length <= 0 || functions.length <= 0) return
        const timeout = setTimeout(() => {
            const flow = flowService.getById(flowId)
            if (!flow) return
            const snapshot = JSON.parse(JSON.stringify(flow))
            if (nodeId === undefined) {
                const settingNode = snapshot?.settings?.nodes?.[parameterIndex]
                if (!settingNode) return
                settingNode.value = editedObject?.value
            } else {
                const node = snapshot?.nodes?.nodes?.find((candidate: any) => candidate?.id === nodeId)
                const parameterNode = node?.parameters?.nodes?.[parameterIndex]
                if (!parameterNode) return
                parameterNode.value = editedObject
            }
            const requestId = ++latestSchemaRequest.current
            execute({flow: snapshot, dataTypes, functions, nodeId}).then(signatureSchema => {
                if (requestId !== latestSchemaRequest.current) return
                setLiveSchema(signatureSchema?.parameters?.[parameterIndex]?.schema)
            })
        }, 200)
        return () => clearTimeout(timeout)
    }, [editedObject, flowId, nodeId, parameterIndex, dataTypes, functions])

    React.useEffect(() => {
        setActivePath(entry?.path ?? [])
        setEditedObject(value)
    }, [entry])

    React.useEffect(
        () => setEditOpen(open),
        [open]
    )

    const getValueAtPath = (obj: LiteralValue | null, path: string[]): unknown => {
        let current: unknown = obj?.value
        for (const key of path) {
            if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
                current = (current as Record<string, unknown>)[key]
            } else {
                return undefined
            }
        }
        return current
    }

    const setValueAtPath = (obj: LiteralValue | null, path: string[], nextValue: unknown): LiteralValue | null => {
        if (!obj) return null
        if (path.length === 0) return {...obj, value: nextValue}
        const [key, ...rest] = path
        if (Array.isArray(obj.value)) {
            const index = Number(key)
            const nextArray = [...obj.value]
            if (rest.length > 0 && typeof nextArray[index] === "object" && nextArray[index] !== null) {
                nextArray[index] = setValueAtPath({...obj, value: nextArray[index]}, rest, nextValue)?.value
            } else {
                nextArray[index] = nextValue
            }
            return {...obj, value: nextArray}
        }
        if (typeof obj.value === "object" && obj.value !== null) {
            const nextObject = {...obj.value}
            if (rest.length > 0 && typeof nextObject[key] === "object" && nextObject[key] !== null) {
                nextObject[key] = setValueAtPath({...obj, value: nextObject[key]}, rest, nextValue)?.value
            } else {
                nextObject[key] = nextValue
            }
            return {...obj, value: nextObject}
        }
        return {...obj, value: nextValue}
    }

    const collectSignatures = (val: unknown, acc: Set<string>): void => {
        if (typeof val === "string") {
            const match = val.match(/^\$\{(.+)}$/)
            if (match) acc.add(match[1])
        } else if (val && typeof val === "object") {
            Object.values(val as Record<string, unknown>).forEach(child => collectSignatures(child, acc))
        }
    }

    const pruneReferences = (obj: LiteralValue | null): LiteralValue | null => {
        if (!obj || !obj.references || obj.references.length === 0) return obj
        const used = new Set<string>()
        collectSignatures(obj.value, used)
        const references = obj.references.filter(reference => reference.signature && used.has(reference.signature))
        return references.length === obj.references.length ? obj : {...obj, references}
    }

    const setCollapsedState = (path: string[], collapsed: boolean) => {
        setCollapsedStateRaw(prev => ({...prev, [path.join(".")]: collapsed}))
    }

    const handleEntryClick = (clickedEntry: EditableJSONEntry) => {
        if (clickTimeout.current) clearTimeout(clickTimeout.current)
        clickTimeout.current = setTimeout(() => {
            setActivePath(clickedEntry.path ?? [])
        }, 200)
    }

    const handleRuleDoubleClick = (currentPath: string[], isCollapsed: boolean) => {
        if (clickTimeout.current) clearTimeout(clickTimeout.current)
        setCollapsedState(currentPath, !isCollapsed)
    }

    const collectContainerPaths = (): string[][] => {
        const result: string[][] = []
        const walk = (val: unknown, path: string[]) => {
            if (val && typeof val === "object") {
                Object.entries(val as Record<string, unknown>).forEach(([key, child]) => {
                    if (child && typeof child === "object") {
                        const childPath = [...path, key]
                        result.push(childPath)
                        walk(child, childPath)
                    }
                })
            }
        }
        walk(getValueAtPath(editedObject, activePath), activePath)
        return result
    }

    const openAll = () => setCollapsedStateRaw(prev => {
        const next: Record<string, boolean> = {...prev, root: false}
        collectContainerPaths().forEach(path => next[path.join(".")] = false)
        return next
    })

    const closeAll = () => setCollapsedStateRaw(prev => {
        const next: Record<string, boolean> = {...prev}
        collectContainerPaths().forEach(path => next[path.join(".")] = true)
        return next
    })

    const openActive = () => setCollapsedStateRaw(prev => {
        const next: Record<string, boolean> = {...prev, root: false}
        collectContainerPaths().forEach(path => next[path.join(".")] = path.length > activePath.length + 1)
        return next
    })

    const handleValueChange = (path: string[], val: unknown) => {
        setEditedObject(prev => {
            const updated = pruneReferences(setValueAtPath(prev, path, val))
            onObjectChange?.(updated)
            return updated
        })
    }

    const handleStructureChange = (path: string[], val: unknown) => {
        setEditedObject(prev => {
            const updated = pruneReferences(setValueAtPath(prev, path, val))
            onObjectChange?.(updated)
            return updated
        })
    }

    const handleReferenceChange = (signature: string, referenceValue: ReferenceValue | SubFlowValue) => {
        setEditedObject(prev => {
            if (!prev) return prev
            const updated: LiteralValue = {
                ...prev,
                references: [
                    ...(prev.references ?? []).filter(reference => reference.signature !== signature),
                    {__typename: "InlineReferenceValue", signature, value: referenceValue}
                ]
            }
            onObjectChange?.(updated)
            return updated
        })
    }

    return (
        <Dialog open={editOpen} onOpenChange={(open) => {
            onOpenChange?.(open)
            if (!open) onObjectClose?.(editedObject)
        }}>
            <DialogPortal>
                <DialogOverlay/>
                <DialogContent aria-describedby="DFlowInputObjectEditDialog" onPointerDownOutside={e => {
                    const target = e.target as HTMLElement
                    if (target.closest("[data-slot=resizable-handle]") || target.closest("[data-slot=resizable-panel]")) {
                        e.preventDefault()
                    }
                }} w={"75%"} h={"75%"} style={{padding: "2px"}}>
                    <Layout layoutGap={0} showLayoutSplitter={false}
                            topContent={
                                <Flex style={{gap: ".7rem"}} p={0.7} justify={"space-between"} align={"center"}>
                                    <DataTypeJSONInputBreadcrumbComponent
                                        schema={schema}
                                        value={editedObject}
                                        activePath={activePath}
                                        onActivePathChange={setActivePath}
                                    />
                                    <DialogClose asChild>
                                        <Button variant={"none"} color={"tertiary"} style={{
                                            padding: getSize("xs")
                                        }}>
                                            <IconX size={13}/>
                                        </Button>
                                    </DialogClose>
                                </Flex>
                            }>
                        <ResizablePanelGroup style={{borderRadius: "1rem"}}>
                            <ResizablePanel defaultSize={"25%"} color="primary">
                                <Flex style={{flexDirection: "column", height: "100%"}}>
                                    <Flex justify={"space-between"} align={"center"} style={{padding: `${getSize("xxs")} ${getSize("sm")}`}}>
                                        <Text hierarchy={"tertiary"}>Structure</Text>
                                        <ButtonGroup bg={"transparent"} style={{boxShadow: "none"}} p={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant={"none"} paddingSize={"xxs"} onClick={openActive}>
                                                        <IconCircleDot size={13}/>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipPortal>
                                                    <TooltipContent side={"bottom"}>
                                                        <Text>Open active level</Text>
                                                        <TooltipArrow/>
                                                    </TooltipContent>
                                                </TooltipPortal>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant={"none"} paddingSize={"xxs"} onClick={closeAll}>
                                                        <IconArrowsMinimize size={13}/>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipPortal>
                                                    <TooltipContent side={"bottom"}>
                                                        <Text>Close all</Text>
                                                        <TooltipArrow/>
                                                    </TooltipContent>
                                                </TooltipPortal>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant={"none"} paddingSize={"xxs"} onClick={openAll}>
                                                        <IconArrowsMaximize size={13}/>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipPortal>
                                                    <TooltipContent side={"bottom"}>
                                                        <Text>Open all</Text>
                                                        <TooltipArrow/>
                                                    </TooltipContent>
                                                </TooltipPortal>
                                            </Tooltip>
                                        </ButtonGroup>
                                    </Flex>
                                    <div style={{flex: "1 1 auto", minHeight: 0}}>
                                        <ScrollArea h="100%" w="100%" type="scroll">
                                            <ScrollAreaViewport>
                                                <div style={{padding: `0 ${getSize("sm")}`}}>
                                                    <DataTypeJSONInputTreeComponent
                                                        object={{
                                                            __typename: "LiteralValue",
                                                            value: getValueAtPath(editedObject, activePath)
                                                        }}
                                                        references={editedObject?.references ?? undefined}
                                                        path={activePath}
                                                        rootDepth={activePath.length}
                                                        onEntryClick={handleEntryClick}
                                                        collapsedState={collapsedState}
                                                        setCollapsedState={setCollapsedState}
                                                        activePath={activePath}
                                                        onDoubleClick={handleRuleDoubleClick}
                                                    />
                                                </div>
                                            </ScrollAreaViewport>
                                            <ScrollAreaScrollbar orientation="vertical">
                                                <ScrollAreaThumb/>
                                            </ScrollAreaScrollbar>
                                            <ScrollAreaScrollbar orientation="horizontal">
                                                <ScrollAreaThumb/>
                                            </ScrollAreaScrollbar>
                                        </ScrollArea>
                                    </div>
                                </Flex>
                            </ResizablePanel>
                            <ResizableHandle/>
                            <ResizablePanel color="primary">
                                <ScrollArea h="100%" w="100%" type="scroll">
                                    <ScrollAreaViewport>
                                        <div style={{maxWidth: "75%", margin: "0 auto", padding: "4rem 1rem"}}>
                                            <DataTypeJSONInputFormComponent
                                                key={activePath.join(".")}
                                                schema={schema}
                                                valueSchema={liveSchema}
                                                value={editedObject}
                                                activePath={activePath}
                                                onActivePathChange={setActivePath}
                                                onValueChange={handleValueChange}
                                                onStructureChange={handleStructureChange}
                                                onReferenceChange={handleReferenceChange}
                                            />
                                        </div>
                                    </ScrollAreaViewport>
                                    <ScrollAreaScrollbar orientation="vertical">
                                        <ScrollAreaThumb/>
                                    </ScrollAreaScrollbar>
                                </ScrollArea>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </Layout>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    )
}
