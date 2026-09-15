import React from "react"
import {LiteralValue, NodeFunction, NodeParameterValue, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types"
import {Schema} from "@code0-tech/triangulum"
import {Button, Flex, getSize, InputDescription, InputLabel, Spacing, Text} from "@code0-tech/pictor"
import {IconChevronRight, IconPencil, IconTrash} from "@tabler/icons-react"
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent"
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent"

type InputChange = ReferenceValue | SubFlowValue | LiteralValue | NodeFunction | null

export interface DataTypeJSONInputFieldComponentProps {
    label: string
    description: string
    schema: Schema | undefined
    reference: NodeParameterValue | undefined
    initialValue: NodeParameterValue | undefined
    editableKey?: boolean
    onKeyChange?: (key: string) => void
    onDrillIn: () => void
    onChange: (change: InputChange) => void
    onSelect: (change: InputChange) => void
    onRemove: () => void
}

export const DataTypeJSONInputFieldComponent: React.FC<DataTypeJSONInputFieldComponentProps> = (props) => {

    const {label, description, schema, reference, initialValue, editableKey, onKeyChange, onDrillIn, onChange, onSelect, onRemove} = props

    const [editingKey, setEditingKey] = React.useState(false)

    const isContainer = schema?.input === "data" || schema?.input === "type" || schema?.input === "list"
    const drillIn = isContainer && !reference

    return (
        <div>
            {editableKey
                ? editingKey
                    ? <input autoFocus
                             value={label}
                             size={Math.max((label?.length ?? 0) + 1, 3)}
                             onBlur={() => setEditingKey(false)}
                             onChange={event => onKeyChange?.(event.target.value)}
                             style={{
                                 width: "fit-content",
                                 padding: 0,
                                 margin: 0,
                                 border: "none",
                                 outline: "none",
                                 background: "transparent",
                                 color: "rgba(255, 255, 255, 0.75)",
                                 fontFamily: "Inter, sans-serif",
                                 fontWeight: 400,
                                 fontSize: "0.563rem",
                                 letterSpacing: "-0.5px",
                                 textTransform: "uppercase"
                             }}/>
                    : <Flex align={"center"} style={{gap: "0.35rem", cursor: "pointer", width: "fit-content"}}
                            onClick={() => setEditingKey(true)}>
                        <InputLabel style={{cursor: "pointer"}}>{label}</InputLabel>
                        <IconPencil size={11} style={{opacity: 0.5}}/>
                    </Flex>
                : <InputLabel>{label}</InputLabel>}

            <InputDescription>{description}</InputDescription>

            <Flex align={"center"} style={{gap: "0.5rem"}} w={"100%"}>
                <div style={{flex: "1 1 auto", minWidth: 0}}>
                    {drillIn
                        ? <Button color={"tertiary"} paddingSize={"xs"} w={"100%"} onClick={onDrillIn}>
                            <Flex justify={"space-between"} align={"center"} w={"100%"}>
                                <Text size={"sm"} hierarchy={"tertiary"}>{schema?.input === "list" ? "is a list of" : "is a nested object"}</Text>
                                <IconChevronRight size={13}/>
                            </Flex>
                        </Button>
                        : <DataTypeInputComponent schema={schema as Schema}
                                                  formValidation={{valid: true}}
                                                  clearable
                                                  initialValue={initialValue}
                                                  onChange={onChange}/>}
                </div>
                {drillIn && (
                    <DataTypeInputControlsComponent suggestions={schema?.suggestions} onSelect={onSelect}/>
                )}
                <Button variant={"none"} color={"secondary"} style={{padding: getSize("xs")}} onClick={onRemove}>
                    <IconTrash size={13}/>
                </Button>
            </Flex>

            <Spacing spacing={"md"}/>
        </div>
    )
}
