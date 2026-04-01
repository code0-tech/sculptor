import React from "react"
import {IconEdit, IconX} from "@tabler/icons-react"
import "../type/DataTypeTypeInputComponent.style.scss"
import {Flow, LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {Button, Card, Flex, InputDescription, InputLabel, InputMessage, InputProps, Text} from "@code0-tech/pictor";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {
    DataTypeTypeInputEditDialogComponent
} from "@edition/datatype/components/inputs/datatype/DataTypeTypeInputEditDialogComponent";
import {DataTypeTypeEditorInput} from "@edition/datatype/components/inputs/datatype/DataTypeTypeEditorInput";


export interface DataTypeJSONInputComponentProps extends Omit<InputProps<any | null>, "wrapperComponent" | "type"> {
    flowId: Flow['id']
    clearable?: boolean
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeTypeInputComponent: React.FC<DataTypeJSONInputComponentProps> = (props) => {


    const {initialValue, title, description, formValidation, onChange} = props


    const [literalValue, setLiteralValue] = React.useState<string | null>(initialValue)
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)

    const handleClear = React.useCallback(
        () => {
            setLiteralValue("")
        },
        [null]
    )

    React.useEffect(() => {
        formValidation?.setValue(literalValue)
        setTimeout(() => {
            // @ts-ignore
            onChange?.()
        }, 100)

    }, [literalValue])

    return (
        <>
            <DataTypeTypeInputEditDialogComponent
                key={`edit-dialog-${editDialogOpen}`}
                open={editDialogOpen}
                value={initialValue}
                onOpenChange={open => setEditDialogOpen(open)}
                onTypeChange={v => {
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
                    <DataTypeTypeEditorInput value={initialValue}
                                             readonly
                                             suggestions={undefined}
                                             showValidation={false}
                                             showTooltips={false}
                                             basicSetup={{
                                                 highlightActiveLineGutter: false,
                                                 highlightActiveLine: false,
                                                 lineNumbers: false
                                             }}
                                             key={`type-editor}`}/>
                </Card>
            </Card>
            {!formValidation?.valid && formValidation?.notValidMessage && (
                <InputMessage>{formValidation.notValidMessage}</InputMessage>
            )}
        </>
    )
}
