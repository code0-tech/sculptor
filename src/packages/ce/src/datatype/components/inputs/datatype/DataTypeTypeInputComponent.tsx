import React, {useMemo} from "react"
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
import {
    DataTypeTypeInputEditDialogComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeInputEditDialogComponent";
import {DataTypeJSONInputTreeComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputTreeComponent";
import {useValueExtractionAction} from "@edition/flow/components/FlowWorkerProvider";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";


export interface DataTypeJSONInputComponentProps extends Omit<InputProps<any | null>, "wrapperComponent" | "type"> {
    flowId: Flow['id']
    clearable?: boolean
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeTypeInputComponent: React.FC<DataTypeJSONInputComponentProps> = (props) => {


    const {initialValue, title, description, formValidation, onChange} = props

    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const valueFromTypeAction = useValueExtractionAction()

    const [type, setType] = React.useState<string | null>(initialValue)
    const [literalValue, setLiteralValue] = React.useState<LiteralValue>()
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)

    const dataTypes = useMemo(
        () => dataTypeService.values(),
        [dataTypeStore]
    )

    const handleClear = React.useCallback(
        () => setType(""),
        []
    )

    React.useEffect(() => {
        formValidation?.setValue(type)
        const timeout = setTimeout(() => {
            // @ts-ignore
            onChange?.()
        }, 200)

        if (type) {
            valueFromTypeAction.execute({
                type: type,
                dataTypes: dataTypes
            }).then(val => {
                setLiteralValue(val as LiteralValue)
            })
        }

        return () => clearTimeout(timeout);

    }, [type])

    return (
        <>
            <DataTypeTypeInputEditDialogComponent
                key={`edit-dialog-${editDialogOpen}`}
                open={editDialogOpen}
                value={initialValue}
                onOpenChange={open => setEditDialogOpen(open)}
                onTypeChange={v => setType(v ?? null)}
            />
            <div>
                <InputLabel>{title}</InputLabel>
                <InputDescription>{description}</InputDescription>
            </div>
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
                    <DataTypeJSONInputTreeComponent object={literalValue ?? {}}/>
                </Card>
            </Card>
            {!formValidation?.valid && formValidation?.notValidMessage && (
                <InputMessage>{formValidation.notValidMessage}</InputMessage>
            )}
        </>
    )
}
