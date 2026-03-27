import React from "react"
import {IconEdit, IconX} from "@tabler/icons-react"
import "../type/DataTypeTypeInputComponent.style.scss"
import {Flow, LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {
    Button,
    Card,
    Flex,
    InputDescription,
    InputLabel,
    InputMessage,
    InputProps,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {getTypeFromValue, getValueFromType} from "@code0-tech/triangulum";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {
    DataTypeTypeInputTreeComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeInputTreeComponent";
import {
    DataTypeTypeInputEditDialogComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeInputEditDialogComponent";

export interface EditableJSONEntry {
    key: string
    value: LiteralValue | null
    path: string[]
}


export interface DataTypeJSONInputComponentProps extends Omit<InputProps<any | null>, "wrapperComponent" | "type"> {
    flowId: Flow['id']
    clearable?: boolean
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeTypeInputComponent: React.FC<DataTypeJSONInputComponentProps> = (props) => {


    const {initialValue, title, description, formValidation, onChange} = props

    const datatypeService = useService(DatatypeService)
    const datatypeStore = useStore(DatatypeService)

    const initialType = React.useMemo(() => {
        return initialValue
    }, [])

    const initialLiteralValue = React.useMemo(() => {
        return getValueFromType(initialValue, datatypeService.values())
    }, [datatypeStore, initialValue])

    const [literalValue, setLiteralValue] = React.useState<LiteralValue | null>(initialLiteralValue)
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
        setLiteralValue(getValueFromType(initialType, datatypeService.values()))
    }, [])

    React.useEffect(() => {
        const type = getTypeFromValue(literalValue)
        formValidation?.setValue(type)
        setTimeout(() => {
            // @ts-ignore
            onChange?.()
        }, 500)

    }, [literalValue])

    return (
        <>
            <DataTypeTypeInputEditDialogComponent
                key={`edit-dialog-${editEntry?.path.join("-")}-${editDialogOpen}`}
                open={editDialogOpen}
                entry={editEntry}
                value={literalValue}
                onOpenChange={open => setEditDialogOpen(open)}
                onObjectChange={v => {
                    console.log(v)
                    setLiteralValue(v ?? null)
                }}
            />
            <InputLabel>{title}</InputLabel>
            <InputDescription>{description}</InputDescription>
            <Card color="secondary" paddingSize="xs">
                <Flex style={{gap: ".7rem"}} align="center" justify="space-between">
                    <Flex style={{gap: ".35rem"}} align="center">
                        <Text>{"Object"}</Text>
                    </Flex>
                    <ButtonGroup color={"primary"}>
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
                    <DataTypeTypeInputTreeComponent
                        object={literalValue!}
                        onEntryClick={handleEntryClick}
                        collapsedState={collapsedState}
                        setCollapsedState={setCollapsedState}
                    />
                </Card>
            </Card>
            {!formValidation?.valid && formValidation?.notValidMessage && (
                <InputMessage>{formValidation.notValidMessage}</InputMessage>
            )}
        </>
    )
}
