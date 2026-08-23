import React from "react";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {
    Badge,
    InputDescription,
    InputLabel,
    TagInput,
    TagInputMenu,
    TagInputMenuItem,
    TagInputTrigger,
    TagInputValue,
    TagValue,
    Text
} from "@code0-tech/pictor";
import {useDebouncedCallback} from "use-debounce";
import {
    LiteralValue,
    NodeFunction,
    NodeParameterValue,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {NodeSchema, Schema} from "@code0-tech/triangulum";
import {DataTypeInputControlsComponent} from "@edition/datatype/components/inputs/DataTypeInputControlsComponent";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";

export type DataTypeListBooleanInputComponentProps = DataTypeInputComponentProps

export const DataTypeListBooleanInputComponent: React.FC<DataTypeListBooleanInputComponentProps> = (props) => {

    const {schema, formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: NodeParameterValue | NodeFunction | undefined = React.useMemo(() => initialValue ?? undefined, [initialValue])
    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | SubFlowValue | NodeFunction | ReferenceValue | null) => {
        onChange?.(value)
    }, 400)

    const optionSuggestions = React.useMemo(() => {
        const inner = schema && "schema" in schema ? (schema as NodeSchema).schema : (schema as Schema | undefined)
        const items = (inner as { items?: Schema[] })?.items ?? []
        const literals = items.flatMap(item => item.suggestions ?? [])
            .filter((suggest): suggest is LiteralValue => suggest.__typename === "LiteralValue")
        const seen = new Set<string>()
        return literals.filter(literal => {
            const key = JSON.stringify(literal.value)
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
    }, [schema])
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
            <TagInput allowCustomValues={false}
                      placeholder={typeof title === "string" ? title : undefined}
                      initialValue={initialTags}
                      maw={"100%"}
                      tokenRules={[
                          {pattern: /^true$/, wrap: () => <Badge color={"success"}><Text c={"inherit"}>true</Text></Badge>},
                          {pattern: /^false$/, wrap: () => <Badge color={"error"}><Text c={"inherit"}>false</Text></Badge>}
                      ]}
                      formValidation={{...formValidation, setValue: undefined}}
                      onChange={tags => {
                          const value = tags.map(tag => tag.value)
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
                <TagInputMenu openOn={"focus"}>
                    {optionSuggestions.map((suggest, index) => (
                        <TagInputMenuItem key={index} value={suggest.value} data={suggest}>
                            <Text>{String(suggest.value)}</Text>
                        </TagInputMenuItem>
                    ))}
                </TagInputMenu>
                <TagInputValue/>
                <TagInputTrigger/>
            </TagInput>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue, optionSuggestions])
}
