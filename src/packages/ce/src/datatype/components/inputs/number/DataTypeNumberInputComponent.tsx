import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {EditorInput, hashToColor, InputDescription, InputLabel} from "@code0-tech/pictor";
import {StreamLanguage} from "@codemirror/language";
import {tags} from "@lezer/highlight";
import {useDebouncedCallback} from "use-debounce";
import {
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";

export type DataTypeNumberInputComponentProps = DataTypeInputComponentProps

export const DataTypeNumberInputComponent: React.FC<DataTypeNumberInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const onChangeDebounced = useDebouncedCallback((value: string | LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | undefined) => {

        if (typeof value === "string") {
            formValidation?.setValue?.(value ? {__typename: "LiteralValue", value: !Number.isNaN(Number(value)) ? Number(value) : value} : undefined)
            onChange?.(value ? {__typename: "LiteralValue", value: !Number.isNaN(Number(value)) ? Number(value) : value} : undefined)
        } else {
            formValidation?.setValue?.(value)
            onChange?.(value)
        }
    }, 400)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <DataTypeInputValueComponent initialValue={initialValue} onChange={onChangeDebounced} suggestions={suggestions}
                                     formValidation={formValidation}>
            <EditorInput value={(defaultValue as LiteralValue)?.value?.toString()}
                         onChange={onChangeDebounced}
                         formValidation={{...formValidation, setValue: undefined}}
                         maw={"100%"}
                         placeholder={String(title) ?? ""}
                         language={StreamLanguage.define({
                             token(stream) {
                                 stream.next()
                                 return null;
                             }
                         })}
                         tokenStyles={[
                             {tag: tags.keyword, color: hashToColor("bracket")},
                         ]}
                         right={
                             <DataTypeInputControlsComponent suggestions={suggestions} onSelect={onChangeDebounced}/>
                         }
                         rightType={"action"}/>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue])
}
