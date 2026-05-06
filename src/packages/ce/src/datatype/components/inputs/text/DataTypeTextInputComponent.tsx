import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {EditorInput, hashToColor, InputDescription, InputLabel} from "@code0-tech/pictor";
import {NodeBadgeComponent} from "@edition/datatype/components/badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {StreamLanguage} from "@codemirror/language";
import {tags} from "@lezer/highlight";
import {useDebouncedCallback} from "use-debounce";
import {LiteralValue, NodeFunction, NodeParameterValue, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";

export type DataTypeTextInputComponentProps = DataTypeInputComponentProps

export const DataTypeTextInputComponent: React.FC<DataTypeTextInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const onChangeDebounced = useDebouncedCallback((value: string | LiteralValue | NodeFunction | ReferenceValue | undefined) => {

        if (typeof value === "string") {
            formValidation?.setValue?.(value ? {__typename: "LiteralValue", value: value} : undefined)
            onChange?.(value ? {__typename: "LiteralValue", value: value} : undefined)
        } else {
            formValidation?.setValue?.(value)
            onChange?.(value)
        }
    }, 200)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        {defaultValue?.__typename === "NodeFunction" || defaultValue?.__typename === "NodeFunctionIdWrapper" ? (
            <NodeBadgeComponent value={defaultValue}/>
        ) : defaultValue?.__typename === "ReferenceValue" ? (
            <ReferenceBadgeComponent value={defaultValue}/>
        ) : (
            <EditorInput value={(defaultValue as LiteralValue)?.value}
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
        )}
    </>, [formValidation, defaultValue])
}
