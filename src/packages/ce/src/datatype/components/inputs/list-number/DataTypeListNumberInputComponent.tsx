import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    InputDescription,
    InputLabel,
    TagInput,
    TagInputTrigger,
    TagInputValue,
    TagValue
} from "@code0-tech/pictor";
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

export type DataTypeListNumberInputComponentProps = DataTypeInputComponentProps

export const DataTypeListNumberInputComponent: React.FC<DataTypeListNumberInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 400)

    const referenceSuggestions = React.useMemo(
        () => (suggestions ?? []).filter(suggest => suggest.__typename !== "LiteralValue"),
        [suggestions]
    )

    const initialArray = (initialValue as LiteralValue)?.__typename === "LiteralValue" && Array.isArray((initialValue as LiteralValue).value)
        ? (initialValue as LiteralValue).value as unknown[]
        : []
    const initialKey = JSON.stringify(initialArray)
    const initialTags: TagValue[] = React.useMemo(
        () => initialArray.map(entry => ({value: entry})),
        [initialKey]
    )

    const lastValueKey = React.useRef(initialKey)

    return React.useMemo(() => <>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <DataTypeInputValueComponent initialValue={initialValue} onChange={value => {
            formValidation?.setValue?.(value)
            onChangeDebounced(value)
        }} suggestions={referenceSuggestions}
                                     formValidation={formValidation}>
            <TagInput allowCustomValues={true}
                      placeholder={typeof title === "string" ? title : undefined}
                      initialValue={initialTags}
                      maw={"100%"}
                      formValidation={{...formValidation, setValue: undefined}}
                      onChange={tags => {
                          const value = tags.map(tag => {
                              const number = Number(tag.value)
                              return tag.value === "" || Number.isNaN(number) ? tag.value : number
                          })
                          const key = JSON.stringify(value)
                          if (key === lastValueKey.current) return
                          lastValueKey.current = key
                          const literal: LiteralValue = {__typename: "LiteralValue", value}
                          formValidation?.setValue?.(literal)
                          onChangeDebounced(literal)
                      }}
                      right={
                          <DataTypeInputControlsComponent suggestions={referenceSuggestions} onSelect={value => {
                              formValidation?.setValue?.(value)
                              onChangeDebounced(value)
                          }}/>
                      }
                      rightType={"action"}>
                <TagInputValue/>
                <TagInputTrigger/>
            </TagInput>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue])
}
