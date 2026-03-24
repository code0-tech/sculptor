import React from "react"
import {IconAlignLeft, IconEdit, IconX} from "@tabler/icons-react"
import "../type/DataTypeTypeInputComponent.style.scss"
import {DataTypeJSONInputTreeComponent} from "./DataTypeJSONInputTreeComponent";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {LiteralValue, NodeFunction, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {NodeBadgeComponent} from "../../badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "../../badges/ReferenceBadgeComponent";
import {useSuggestions} from "@edition/function/hooks/FunctionSuggestion.hook";
import {
    Button,
    Card,
    Flex,
    InputDescription,
    InputLabel,
    InputMessage,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {FunctionSuggestionMenuComponent} from "@edition/function/components/suggestion/FunctionSuggestionMenuComponent";
import {DataTypeJSONInputEditDialogComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputEditDialogComponent";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {useValue} from "@edition/datatype/hooks/DataType.value.hook";

export interface EditableJSONEntry {
    key: string
    value: LiteralValue | null
    path: string[]
}

export type DataTypeJSONInputComponentProps = DataTypeInputComponentProps

export const DataTypeJSONInputComponent: React.FC<DataTypeJSONInputComponentProps> = (props) => {


    const {flowId, nodeId, parameterIndex, title, description, formValidation, onChange} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const clearValue = useValue(flowId, nodeId, parameterIndex)

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowStore, flowId, nodeId]
    )

    const parameter = React.useMemo(
        () => node?.parameters?.nodes?.[parameterIndex],
        [node, parameterIndex]
    )

    const functionDefinition = React.useMemo(
        () => functionService.getById(node?.functionDefinition?.id!),
        [functionStore, node]
    )

    const parameterDefinition = React.useMemo(
        () => functionDefinition?.parameterDefinitions?.nodes?.find(pd => pd?.id === parameter?.parameterDefinition?.id),
        [functionDefinition, parameter]
    )

    const initialValue: NodeParameterValue | null = (() => {
        if (!parameter?.value || (parameter?.value?.__typename === "LiteralValue" && parameter.value.value == null)) {
            return clearValue
        }
        return parameter?.value
    })()


    const suggestions = useSuggestions(flowId, nodeId, parameterIndex)

    const [value, setValue] = React.useState<NodeParameterValue | NodeFunction | null>(initialValue)
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [editEntry, setEditEntry] = React.useState<EditableJSONEntry | null>(null)
    const [collapsedState, setCollapsedStateRaw] = React.useState<Record<string, boolean>>({})

    const setCollapsedState = (path: string[], collapsed: boolean) => {
        setCollapsedStateRaw(prev => ({...prev, [path.join(".")]: collapsed}))
    }

    const handleEntryClick = (entry: EditableJSONEntry) => {
        setEditEntry(entry)
        setEditDialogOpen(true)
    }

    const handleClear = React.useCallback(() => {
        setValue(clearValue)
    }, [parameter, parameterDefinition, dataTypeStore])

    React.useEffect(() => {
        formValidation?.setValue(value)
        // @ts-ignore
        onChange?.()
    }, [value])

    return (
        <>
            {value?.__typename === "LiteralValue" && (
                <DataTypeJSONInputEditDialogComponent
                    key={String(editDialogOpen)}
                    open={editDialogOpen}
                    entry={editEntry}
                    value={value as any}
                    onOpenChange={open => setEditDialogOpen(open)}
                    onObjectChange={v => setValue(v ?? null)}
                />
            )}
            <InputLabel>{title}</InputLabel>
            <InputDescription>{description}</InputDescription>
            <Card color="secondary" paddingSize="xs">
                <Flex style={{gap: ".7rem"}} align="center" justify="space-between">
                    <Flex style={{gap: ".35rem"}} align="center">
                        <Text>{"Object"}</Text>
                    </Flex>
                    <ButtonGroup color={"primary"}>
                        <FunctionSuggestionMenuComponent suggestions={suggestions}
                                                         onSuggestionSelect={suggestion => setValue(suggestion.value)}
                                                         triggerContent={<Button paddingSize="xxs" variant="filled"
                                                                        color="secondary"
                                                                        onClick={() => setEditDialogOpen(true)}>
                                                    <IconAlignLeft size={13}/>
                                                </Button>}/>
                        <Button paddingSize="xxs" variant="filled" color="secondary"
                                onClick={() => setEditDialogOpen(true)}>
                            <IconEdit size={13}/>
                        </Button>
                        <Button paddingSize="xxs" variant="filled" color="secondary"
                                onClick={handleClear}>
                            <IconX size={13}/>
                        </Button>
                    </ButtonGroup>
                </Flex>
                <Card paddingSize="xs" mt={0.7} mb={-0.55} mx={-0.55}>
                    {value?.__typename === "NodeFunction" || value?.__typename === "NodeFunctionIdWrapper" ? (
                        <NodeBadgeComponent value={value}/>
                    ) : value?.__typename === "ReferenceValue" ? (
                        <ReferenceBadgeComponent value={value}/>
                    ) : (
                        <DataTypeJSONInputTreeComponent
                            object={value as any}
                            onEntryClick={handleEntryClick}
                            collapsedState={collapsedState}
                            setCollapsedState={setCollapsedState}
                        />
                    )}
                </Card>
            </Card>
            {!formValidation?.valid && formValidation?.notValidMessage && (
                <InputMessage>{formValidation.notValidMessage}</InputMessage>
            )}
        </>
    )
}
