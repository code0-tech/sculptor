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
import {
    DataTypeJSONInputEditDialogComponent
} from "@edition/datatype/components/inputs/json/DataTypeJSONInputEditDialogComponent";
import {FlowService} from "@edition/flow/services/Flow.service";
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

    const initialNullValue = useValue(flowId, nodeId, parameterIndex)
    const suggestions = useSuggestions(flowId, nodeId, parameterIndex)
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [editEntry, setEditEntry] = React.useState<EditableJSONEntry | null>(null)
    const [collapsedState, setCollapsedStateRaw] = React.useState<Record<string, boolean>>({})

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowStore, flowId, nodeId]
    )

    const parameter = React.useMemo(
        () => node?.parameters?.nodes?.[parameterIndex],
        [node]
    )

    const initialValue: NodeParameterValue | null = React.useMemo(() => {
        if (!parameter?.value || (parameter?.value?.__typename === "LiteralValue" && parameter.value.value == null)) {
            return initialNullValue
        }
        return parameter?.value
    }, [initialNullValue, parameter])

    const [value, setValue] = React.useState<NodeParameterValue | NodeFunction | null>(initialValue)

    const setCollapsedState = (path: string[], collapsed: boolean) => {
        setCollapsedStateRaw(prev => ({...prev, [path.join(".")]: collapsed}))
    }

    const handleEntryClick = (entry: EditableJSONEntry) => {
        setEditEntry(entry)
        setEditDialogOpen(true)
    }

    React.useEffect(() => {
        if (!parameter?.value || (parameter?.value?.__typename === "LiteralValue" && parameter.value.value == null)) {
            formValidation?.setValue(initialNullValue)
            setValue(initialNullValue)
            // @ts-ignore
            onChange?.()
        }
    }, [initialNullValue])

    const handleClear = React.useCallback(() => {
        formValidation?.setValue(initialNullValue)
        setValue(initialNullValue)
        setEditEntry(null)
        // @ts-ignore
        onChange?.()
    }, [initialNullValue])

    return (
        <>
            {value?.__typename === "LiteralValue" && (
                <DataTypeJSONInputEditDialogComponent
                    key={`edit-dialog-${editEntry?.path.join("-")}-${editDialogOpen}`}
                    open={editDialogOpen}
                    entry={editEntry}
                    value={value as any}
                    onOpenChange={open => setEditDialogOpen(open)}
                    onObjectChange={v => {
                        formValidation?.setValue(v)
                        setValue(v ?? null)
                        // @ts-ignore
                        onChange?.()
                    }}
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
                                                         onSuggestionSelect={suggestion => {
                                                             formValidation?.setValue(suggestion.value)
                                                             setValue(suggestion.value)
                                                             // @ts-ignore
                                                             onChange?.()
                                                         }}
                                                         triggerContent={<Button paddingSize="xxs" variant="filled"
                                                                                 color="secondary"
                                                                                 onClick={() => setEditDialogOpen(true)}>
                                                             <IconAlignLeft size={13}/>
                                                         </Button>}/>
                        <Button paddingSize="xxs"
                                variant="filled"
                                disabled={value?.__typename != "LiteralValue"}
                                color="secondary"
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
