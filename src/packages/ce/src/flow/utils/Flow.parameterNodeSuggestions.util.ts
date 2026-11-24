import {NodeFunction, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types";
import {NodeSchema} from "@code0-tech/triangulum";
import {exactSuggestions} from "@edition/datatype/utils/DataType.exactSuggestions.util";
import {ownSuggestionCertainties} from "@edition/datatype/utils/DataType.suggestionCertainties.util";
import {
    listElementSuggestions,
    listNodeSuggestions
} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";
import {SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";

// the suggestions triangulum offers for a parameter that are nodes or sub flows - an empty result means
// the parameter has nothing to offer and whoever asks has to fall back to the whole function catalogue
export const parameterNodeSuggestions = (schema?: NodeSchema): (SubFlowValue | NodeFunction)[] => {
    if (!schema) return []

    const input = schema.schema?.input
    const suggestions = (schema.schema?.suggestions ?? []) as SuggestionValue[]

    const available: (SuggestionValue | ReferenceValue)[] = input === "sub-flow"
        ? exactSuggestions(suggestions, ownSuggestionCertainties(schema))
        : input === "list-sub-flow"
            ? listNodeSuggestions(schema, suggestions)
            : listElementSuggestions(schema, suggestions)

    return available.filter((suggestion): suggestion is SubFlowValue | NodeFunction =>
        suggestion.__typename === "SubFlowValue" || suggestion.__typename === "NodeFunction")
}
