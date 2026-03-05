import React from "react"
import {IconAlignLeft, IconEdit, IconX} from "@tabler/icons-react"
import "./DataTypeTypeInput.style.scss"
import {DataTypeJSONInputTree} from "./DataTypeJSONInputTree";
import {DataTypeInputProps} from "./DataTypeInput";
import {LiteralValue, NodeFunction, NodeParameterValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputNodeBadge} from "./DataTypeInputNodeBadge";
import {DataTypeInputReferenceBadge} from "./DataTypeInputReferenceBadge";
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
import {FunctionSuggestionMenu} from "@edition/function/components/FunctionSuggestionMenu";
import {DataTypeJSONInputEditDialog} from "@edition/datatype/components/DataTypeJSONInputEditDialog";
import {FlowService} from "@edition/flow/services/Flow.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";

export interface EditableJSONEntry {
    key: string
    value: LiteralValue | null
    path: string[]
}

export type DataTypeJSONInputProps = DataTypeInputProps

export const DataTypeJSONInput: React.FC<DataTypeJSONInputProps> = (props) => {


    const {flowId, nodeId, parameterId, title, description, formValidation, onChange} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowStore, flowId, nodeId]
    )

    const parameter = React.useMemo(
        () => node?.parameters?.nodes?.find(p => p?.id === parameterId),
        [node, parameterId]
    )

    const functionDefinition = React.useMemo(
        () => functionService.getById(node?.functionDefinition?.id!),
        [functionStore, node]
    )

    const parameterDefinition = React.useMemo(
        () => functionDefinition?.parameterDefinitions?.find(pd => pd.id === parameter?.parameterDefinition?.id),
        [functionDefinition, parameter]
    )

    const initialValue: NodeParameterValue | undefined = React.useMemo(() => {
        if (!parameter?.value || (parameter?.value?.__typename === "LiteralValue" && parameter.value.value == null)) {
            return dataTypeService.getValueFromType(parameterDefinition?.dataTypeIdentifier!)
        }
        return parameter?.value
    }, [parameter, parameterDefinition, dataTypeStore])


    const suggestions = useSuggestions(flowId, nodeId, parameterId)

    const [value, setValue] = React.useState<NodeParameterValue | NodeFunction | undefined>(initialValue)
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
        setValue(dataTypeService.getValueFromType(parameterDefinition?.dataTypeIdentifier!))
    }, [parameter, parameterDefinition, dataTypeStore])

    React.useEffect(() => {
        formValidation?.setValue(value)
        // @ts-ignore
        onChange?.()
    }, [value])

    return (
        <>
            {value?.__typename === "LiteralValue" && (
                <DataTypeJSONInputEditDialog
                    key={String(editDialogOpen)}
                    open={editDialogOpen}
                    entry={editEntry}
                    value={value as any}
                    onOpenChange={open => setEditDialogOpen(open)}
                    onObjectChange={v => setValue(v ?? undefined)}
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
                        <FunctionSuggestionMenu suggestions={suggestions}
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
                        <DataTypeInputNodeBadge value={value} flowId={flowId}/>
                    ) : value?.__typename === "ReferenceValue" ? (
                        <DataTypeInputReferenceBadge value={value} flowId={flowId}/>
                    ) : (
                        <DataTypeJSONInputTree
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
