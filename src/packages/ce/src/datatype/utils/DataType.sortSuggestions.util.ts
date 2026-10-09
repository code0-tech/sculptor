import {SuggestionCertainty, SuggestionMatchReason} from "@code0-tech/triangulum";
import {SuggestionValue} from "@edition/function/components/suggestion/Suggestion.util";

const RANK: Record<SuggestionMatchReason, number> = {
    "nullable": 1,
    "union-member": 2,
    "generic": 3,
    "unconstrained": 4
}

export const sortSuggestions = <T extends SuggestionValue>(
    suggestions: T[],
    certainties: Map<string, SuggestionCertainty>
): T[] => {
    if (certainties.size <= 0) return suggestions

    const ranked = suggestions.map(suggestion => {
        const certainty = certainties.get(JSON.stringify(suggestion))
        return {
            suggestion,
            rank: !certainty || certainty.match === "exact" ? 0 : RANK[certainty.reason ?? "unconstrained"]
        }
    })

    return ranked.sort((first, second) => first.rank - second.rank).map(entry => entry.suggestion)
}
