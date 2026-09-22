import React from "react"
import {
    Alert,
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
    SegmentedControl,
    SegmentedControlItem,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor"
import {Editor} from "@code0-tech/pictor/dist/components/editor/Editor"
import {IconX} from "@tabler/icons-react"
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout"
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types"
import {useValueExtractionAction} from "@edition/flow/components/FlowWorkerProvider"
import {DatatypeService} from "@edition/datatype/services/Datatype.service"
import {ModuleService} from "@edition/module/services/Module.service"
import {
    collectTypeErrors,
    getNodeAtPath,
    inferTypeFromValue,
    parseTypeToNode,
    serializeType,
    TypeNode
} from "@edition/datatype/components/inputs/datatype/DataTypeType.node.util"
import {
    DataTypeTypeBuilderFormComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeBuilderFormComponent"
import {
    DataTypeTypeBuilderBreadcrumbComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeBuilderBreadcrumbComponent"

export interface DataTypeTypeInputEditDialogComponentProps {
    open: boolean
    value: string | null
    onOpenChange?: (open: boolean) => void
    onTypeClose?: (type: string | null) => void
}

export const DataTypeTypeInputEditDialogComponent: React.FC<DataTypeTypeInputEditDialogComponentProps> = (props) => {

    const {open, value, onOpenChange, onTypeClose} = props

    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const moduleService = useService(ModuleService)
    const moduleStore = useStore(ModuleService)
    const valueFromTypeAction = useValueExtractionAction()

    const [root, setRoot] = React.useState<TypeNode>(() => parseTypeToNode(value))
    const [activePath, setActivePath] = React.useState<number[]>([])
    const [showErrors, setShowErrors] = React.useState<boolean>(false)
    const [mode, setMode] = React.useState<string>("manual")
    const [json, setJson] = React.useState<unknown>(null)

    const errors = React.useMemo(() => collectTypeErrors(root), [root])

    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore])
    const modules = React.useMemo(() => moduleService.values(), [moduleStore])

    const dataTypeOptions = React.useMemo(
        () => dataTypes.map(dataType => {
            const module = modules.find(candidate => candidate.id === dataType.runtimeModule?.id)
            return {
                identifier: dataType.identifier!,
                generics: dataType.genericKeys?.length ?? 0,
                label: dataType.name?.[0]?.content || dataType.identifier!,
                displayMessage: dataType.displayMessages?.[0]?.content ?? undefined,
                genericKeys: dataType.genericKeys ?? [],
                moduleId: dataType.runtimeModule?.id ?? undefined,
                moduleName: module?.names?.[0]?.content ?? undefined,
                moduleIcon: module?.icon ?? undefined
            }
        }),
        [dataTypes, modules]
    )

    React.useEffect(() => {
        if (open) {
            const parsed = parseTypeToNode(value)
            setRoot(parsed)
            setActivePath([])
            setShowErrors(false)
            setMode("manual")
            setJson(null)
        }
    }, [open])

    React.useEffect(() => {
        if (errors.length === 0) setShowErrors(false)
    }, [errors.length])

    React.useEffect(() => {
        if (activePath.length > 0 && !getNodeAtPath(root, activePath)) setActivePath([])
    }, [root, activePath])

    const handleModeChange = (next: string) => {
        if (!next) return
        if (next !== "json") return setMode(next)

        const type = serializeType(root)
        if (!type) {
            setJson(null)
            setMode(next)
            return
        }
        valueFromTypeAction.execute({type, dataTypes}).then(extracted => {
            setJson((extracted as LiteralValue | undefined)?.value ?? null)
            setMode(next)
        })
    }

    const handleOpenChange = (next: boolean) => {
        if (!next && errors.length > 0) {
            setShowErrors(true)
            return
        }
        onOpenChange?.(next)
        if (!next) onTypeClose?.(serializeType(root) || null)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogPortal>
                <DialogOverlay/>
                <DialogContent aria-describedby="DFlowTypeBuilderDialog" w={"75%"} h={"75%"} style={{padding: "2px"}}>
                    <Layout layoutGap={0} showLayoutSplitter={false}
                            topContent={
                                <Flex style={{flexDirection: "column", gap: ".5rem"}} p={0.7}>
                                    <Flex style={{gap: ".7rem"}} justify={"space-between"} align={"center"}>
                                        {mode === "manual" ? (
                                            <DataTypeTypeBuilderBreadcrumbComponent root={root}
                                                                                    activePath={activePath}
                                                                                    dataTypeOptions={dataTypeOptions}
                                                                                    onActivePathChange={setActivePath}/>
                                        ) : <div/>}
                                        <Flex align={"center"} style={{gap: getSize("xs")}}>
                                            <SegmentedControl type={"single"}
                                                              color={"primary"}
                                                              value={mode}
                                                              onValueChange={handleModeChange}>
                                                <SegmentedControlItem value={"manual"}>
                                                    <Text>Manual</Text>
                                                </SegmentedControlItem>
                                                <SegmentedControlItem value={"json"}>
                                                    <Text>JSON</Text>
                                                </SegmentedControlItem>
                                            </SegmentedControl>
                                            <DialogClose asChild>
                                                <Button variant={"none"} color={"tertiary"} style={{padding: getSize("xs")}}>
                                                    <IconX size={13}/>
                                                </Button>
                                            </DialogClose>
                                        </Flex>
                                    </Flex>
                                    {showErrors && errors.length > 0 && (
                                        <Alert color={"error"}>
                                            <Text size={"sm"}>
                                                {[...new Set(errors.map(error => error.message))].join(" ")} Fix this before closing, or your changes will be lost.
                                            </Text>
                                        </Alert>
                                    )}
                                </Flex>
                            }>
                        <div style={{background: "#070514", borderRadius: "1rem", height: "100%"}}>
                            {mode === "manual" ? (
                                <ScrollArea h="100%" w="100%" type="scroll">
                                    <ScrollAreaViewport>
                                        <div style={{maxWidth: "42rem", margin: "0 auto", padding: "3rem 1rem"}}>
                                            <DataTypeTypeBuilderFormComponent root={root}
                                                                              activePath={activePath}
                                                                              dataTypeOptions={dataTypeOptions}
                                                                              showErrors={showErrors}
                                                                              onRootChange={setRoot}
                                                                              onActivePathChange={setActivePath}/>
                                        </div>
                                    </ScrollAreaViewport>
                                    <ScrollAreaScrollbar orientation="vertical">
                                        <ScrollAreaThumb/>
                                    </ScrollAreaScrollbar>
                                </ScrollArea>
                            ) : (
                                <Editor language={"json"}
                                        initialValue={json}
                                        showTooltips={false}
                                        basicSetup={{autocompletion: false}}
                                        onChange={next => {
                                            setActivePath([])
                                            setRoot(inferTypeFromValue(next))
                                        }}/>
                            )}
                        </div>
                    </Layout>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    )
}
