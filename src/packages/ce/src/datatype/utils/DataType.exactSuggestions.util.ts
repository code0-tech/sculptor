import {SuggestionCertainty} from "@code0-tech/triangulum";
import {SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";

export const exactSuggestions = <T extends SuggestionValue>(
    suggestions: T[],
    certainties: Map<string, SuggestionCertainty>
): T[] => suggestions.filter(suggestion =>
    (certainties.get(JSON.stringify(suggestion))?.match ?? "exact") === "exact")
