import React from "react"
import "../type/DataTypeTypeInputComponent.style.scss"
import {DataTypeJSONInputTreeComponent} from "./DataTypeJSONInputTreeComponent";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {LiteralValue, NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {ButtonProps, InputDescription, InputLabel, Spacing} from "@code0-tech/pictor";
import {
    DataTypeJSONInputEditDialogComponent
} from "@edition/datatype/components/inputs/json/DataTypeJSONInputEditDialogComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {useDebouncedCallback} from "use-debounce";
import {Schema} from "@code0-tech/triangulum";
import {useDefaultValue} from "@edition/datatype/hooks/DataType.defaultValue.hook";

export interface EditableJSONEntry {
    key: string
    value: LiteralValue | null
    path: string[]
}

export interface DataTypeJSONInputComponentProps extends DataTypeInputComponentProps {
    controlButton?: React.ReactElement<ButtonProps>
}

export const DataTypeJSONInputComponent: React.FC<DataTypeJSONInputComponentProps> = (props) => {

    const {schema, title, description, suggestions, controlButton, formValidation, initialValue, onChange, flowId, nodeId, parameterIndex} = props

    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [editEntry, setEditEntry] = React.useState<EditableJSONEntry | undefined>(undefined)
    const [collapsedState, setCollapsedStateRaw] = React.useState<Record<string, boolean>>({})

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 200)

    const schemaType = React.useMemo(
        () => ("schema" in schema ? schema.schema as Schema : schema as Schema).type,
        [schema]
    )

    const defaultValue = useDefaultValue(schemaType)

    const value = React.useMemo(
        () => initialValue ?? defaultValue ?? {__typename: "LiteralValue", value: {}} as LiteralValue,
        [initialValue, defaultValue]
    )

    const setCollapsedState = (path: string[], collapsed: boolean) => {
        setCollapsedStateRaw(prev => ({...prev, [path.join(".")]: collapsed}))
    }

    const handleEntryClick = (entry: EditableJSONEntry | undefined) => {
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
                    schema={"schema" in schema ? schema.schema as Schema : schema as Schema}
                    flowId={flowId}
                    nodeId={nodeId}
                    parameterIndex={parameterIndex}
                    onOpenChange={open => setEditDialogOpen(open)}
                    onObjectChange={(value) => formValidation?.setValue?.(value)}
                    onObjectClose={(value) => {
                        formValidation?.setValue?.(value)
                        onChangeDebounced(value)
                    }}
                />
            )}
            {title && <InputLabel>{title}</InputLabel>}
            {description && <InputDescription>{description}</InputDescription>}
            <DataTypeInputValueComponent inside
                                         controlButton={controlButton}
                                         initialValue={value}
                                         onChange={(value) => {
                                             formValidation?.setValue?.(value)
                                             onChangeDebounced(value)
                                         }}
                                         onClick={() => handleEntryClick(undefined)}
                                         suggestions={suggestions}
                                         formValidation={formValidation}>
                <DataTypeJSONInputTreeComponent
                    readonly
                    object={value as LiteralValue}
                    references={(value as LiteralValue).references ?? undefined}
                    onEntryClick={handleEntryClick}
                    collapsedState={collapsedState}
                    setCollapsedState={setCollapsedState}
                />
                <Spacing spacing={"xxs"}/>
            </DataTypeInputValueComponent>
        </>
    )
}
