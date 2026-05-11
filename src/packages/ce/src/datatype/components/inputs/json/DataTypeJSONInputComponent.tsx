import React from "react"
import "../type/DataTypeTypeInputComponent.style.scss"
import {DataTypeJSONInputTreeComponent} from "./DataTypeJSONInputTreeComponent";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {InputDescription, InputLabel} from "@code0-tech/pictor";
import {
    DataTypeJSONInputEditDialogComponent
} from "@edition/datatype/components/inputs/json/DataTypeJSONInputEditDialogComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {useDebouncedCallback} from "use-debounce";

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

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | NodeFunction | ReferenceValue | undefined) => {
        formValidation?.setValue?.(value)
        onChange?.(value)
    }, 200)

    const setCollapsedState = (path: string[], collapsed: boolean) => {
        setCollapsedStateRaw(prev => ({...prev, [path.join(".")]: collapsed}))
    }

    const handleEntryClick = (entry: EditableJSONEntry) => {
        setEditEntry(entry)
        setEditDialogOpen(true)
    }

    return (
        <>
            {initialValue?.__typename === "LiteralValue" && (
                <DataTypeJSONInputEditDialogComponent
                    key={`edit-dialog-${editEntry?.path.join("-")}-${editDialogOpen}`}
                    open={editDialogOpen}
                    entry={editEntry}
                    value={initialValue as LiteralValue}
                    onOpenChange={open => setEditDialogOpen(open)}
                    onObjectChange={onChangeDebounced}
                />
            )}
            <InputLabel>{title}</InputLabel>
            <InputDescription>{description}</InputDescription>
            <DataTypeInputValueComponent inside
                                         initialValue={initialValue}
                                         onChange={onChangeDebounced}
                                         suggestions={suggestions}
                                         formValidation={formValidation}>
                <DataTypeJSONInputTreeComponent
                    object={initialValue as LiteralValue}
                    onEntryClick={handleEntryClick}
                    collapsedState={collapsedState}
                    setCollapsedState={setCollapsedState}
                />
            </DataTypeInputValueComponent>
        </>
    )
}
