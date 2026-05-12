import {DataTypeInputComponentProps} from "@edition/datatype/components/inputs/DataTypeInputComponent";
import React from "react";
import {useDebouncedCallback} from "use-debounce";
import {InputDescription, InputLabel, Text} from "@code0-tech/pictor";
import lodash from "lodash"
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";
import {DataTypeInputValueComponent} from "@edition/datatype/components/inputs/DataTypeInputValueComponent";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";


export type DataTypeSubFlowInputComponentProps = DataTypeInputComponentProps


export const DataTypeSubFlowInputComponent: React.FC<DataTypeSubFlowInputComponentProps> = (props) => {

    const {formValidation, title, initialValue, description, suggestions, onChange} = props

    const defaultValue: number = React.useMemo(() => suggestions?.findIndex(suggest => {
        return initialValue && lodash.isMatch(initialValue, suggest)
    }), [suggestions])!

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const result = useFunctionSuggestions()

    const onChangeDebounced = useDebouncedCallback((value: LiteralValue | ReferenceValue | NodeFunction | undefined) => {
        formValidation?.setValue?.(value ?? undefined)
        onChange?.(value ?? undefined)
    }, 200)

    return React.useMemo(() => <>
        <SuggestionDialogComponent suggestions={result}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={suggestion => {
                                       onChangeDebounced(suggestion.value as NodeFunction)
                                   }}
                                   onOpenChange={setSuggestionDialogOpen}/>
        <InputLabel>{title}</InputLabel>
        <InputDescription>{description}</InputDescription>
        <DataTypeInputValueComponent inside
                                     wrapperComponent={{
                                         onClick: () => {
                                             setSuggestionDialogOpen(true)
                                         }
                                     }}
                                     initialValue={initialValue}
                                     onChange={onChangeDebounced}
                                     suggestions={suggestions}
                                     formValidation={formValidation}>
            <Text>Select next node</Text>
        </DataTypeInputValueComponent>
    </>, [formValidation, defaultValue, suggestionDialogOpen])
}