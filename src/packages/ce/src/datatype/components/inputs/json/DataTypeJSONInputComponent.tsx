import React from "react"
import "../type/DataTypeTypeInputComponent.style.scss"
import {DataTypeJSONInputTreeComponent} from "./DataTypeJSONInputTreeComponent";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {InputDescription, InputLabel, Spacing} from "@code0-tech/pictor";
import {
    DataTypeJSONInputEditDialogComponent
} from "@edition/datatype/components/inputs/json/DataTypeJSONInputEditDialogComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {useDebouncedCallback} from "use-debounce";
import {DataInput, ListInput} from "@code0-tech/triangulum/dist/util/schema.util";

export interface EditableJSONEntry {
    key: string
    value: LiteralValue | null
    path: string[]
}

export type DataTypeJSONInputComponentProps = DataTypeInputComponentProps

//TODO render fallback value if undefined based on schema
export const DataTypeJSONInputComponent: React.FC<DataTypeJSONInputComponentProps> = (props) => {

    const {schema, title, description, suggestions, formValidation, initialValue, onChange} = props

    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [editEntry, setEditEntry] = React.useState<EditableJSONEntry | undefined>(undefined)
    const [collapsedState, setCollapsedStateRaw] = React.useState<Record<string, boolean>>({})

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 200)

    const value = React.useMemo(
        () => initialValue ?? (("functionSchema" in schema ? schema.functionSchema.input === "list" : schema.input === "list") ? {
            __typename: "LiteralValue",
            value: []
        } as LiteralValue : generateDefaultDataValue("functionSchema" in schema ? schema.functionSchema as DataInput : schema as DataInput)),
            [initialValue, schema]
    )

    const setCollapsedState = (path: string[], collapsed: boolean) => {
        setCollapsedStateRaw(prev => ({...prev, [path.join(".")]: collapsed}))
    }

    const handleEntryClick = (entry: EditableJSONEntry) => {
        setEditEntry(entry)
        setEditDialogOpen(true)
    }

    return (
        <>
            {value?.__typename === "LiteralValue" && (
                <DataTypeJSONInputEditDialogComponent
                    key={`edit-dialog-${editEntry?.path.join("-")}-${editDialogOpen}`}
                    open={editDialogOpen}
                    entry={editEntry}
                    value={value as LiteralValue}
                    onOpenChange={open => setEditDialogOpen(open)}
                    onObjectChange={(value) => {
                        formValidation?.setValue?.(value)
                        onChangeDebounced(value)
                    }}
                />
            )}
            <InputLabel>{title}</InputLabel>
            <InputDescription>{description}</InputDescription>
            <DataTypeInputValueComponent inside
                                         initialValue={value}
                                         onChange={(value) => {
                                             formValidation?.setValue?.(value)
                                             onChangeDebounced(value)
                                         }}
                                         suggestions={suggestions}
                                         formValidation={formValidation}>
                <DataTypeJSONInputTreeComponent
                    object={value as LiteralValue}
                    onEntryClick={handleEntryClick}
                    collapsedState={collapsedState}
                    setCollapsedState={setCollapsedState}
                />
                <Spacing spacing={"xxs"}/>
            </DataTypeInputValueComponent>
        </>
    )
}


const generateDefaultDataValue = (schema: DataInput): LiteralValue => {
    return {
        __typename: "LiteralValue",
        value: Object.assign({}, ...Object.entries(schema.properties ?? {}).map(([key, propSchema]) => {
            if (!Array.isArray(propSchema)) {
                if (propSchema.input === "data") {
                    return {[key]: generateDefaultDataValue(propSchema).value}
                }
                if (propSchema.input === "list") {
                    const itemSchema = (propSchema as ListInput).items?.[0]
                    if (itemSchema && !Array.isArray(itemSchema) && itemSchema.input === "data") {
                        return {[key]: [generateDefaultDataValue(itemSchema as DataInput).value]}
                    }
                    return {[key]: []}
                }
                return {[key]: null}
            }
        }))
    }
}
