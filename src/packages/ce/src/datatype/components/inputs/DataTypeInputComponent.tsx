import React from "react";
import {DataTypeTextInputComponent} from "./text/DataTypeTextInputComponent";
import {InputProps} from "@code0-tech/pictor";
import {DataTypeJSONInputComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputComponent";
import {NodeSchema} from "@code0-tech/triangulum";
import {LiteralValue, NodeFunction, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {toInputSuggestions} from "@edition/function/components/suggestion/FunctionSuggestionMenuComponent.util";
import {FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";

export interface DataTypeInputComponentProps extends Omit<InputProps<any | null>, "wrapperComponent"> {
    schema: NodeSchema
    clearable?: boolean
    onClear?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const DataTypeInputComponent: React.FC<DataTypeInputComponentProps> = (props) => {

    const {schema, ...rest} = props

    const suggestions = schema?.schema?.suggestions as (NodeFunction | ReferenceValue | LiteralValue)[]
    const functionSuggestions: FunctionSuggestion[] = suggestions?.map((suggest: (NodeFunction | ReferenceValue | LiteralValue)) => {

        return {
            type: suggest.__typename === "NodeFunction" ? FunctionSuggestionType.FUNCTION : suggest.__typename === "ReferenceValue" ? FunctionSuggestionType.REF_OBJECT : FunctionSuggestionType.VALUE,
            value: suggest,
            displayText: suggest.__typename === "NodeFunction" ? suggest.functionDefinition?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME : suggest?.value,
            path: []
        }

    }) ?? []

    switch (schema?.schema?.input) {
        case "data":
        case "list":
            return <DataTypeJSONInputComponent
                schema={schema}
                suggestions={toInputSuggestions(functionSuggestions)}
                {...rest}
            />
        default:
            return <DataTypeTextInputComponent
                suggestions={toInputSuggestions(functionSuggestions)}
                schema={schema}
                {...rest}
            />
    }
}