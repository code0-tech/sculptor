import {FunctionSuggestion, FunctionSuggestionType} from "./FunctionSuggestionComponent.view";
import React from "react";
import {IconCircleDot, IconNote, IconVariable} from "@tabler/icons-react";
import {InputSuggestion, Text} from "@code0-tech/pictor";
import {ReferenceBadgeComponent} from "@edition/datatype/components/badges/ReferenceBadgeComponent";
import {LiteralValue, ReferenceValue} from "@code0-tech/sagittarius-graphql-types";

export const toInputSuggestions = (suggestions: FunctionSuggestion[]): InputSuggestion[] => {

    const staticGroupLabels: Partial<Record<FunctionSuggestionType, string>> = {
        [FunctionSuggestionType.VALUE]: "Values",
        [FunctionSuggestionType.REF_OBJECT]: "Variables",
        [FunctionSuggestionType.DATA_TYPE]: "Datatypes",
    }

    return suggestions.map(suggestion => {

        const iconMap: Record<FunctionSuggestionType, React.ReactNode> = {
            [FunctionSuggestionType.FUNCTION]: <IconNote color="#70ffb2" size={16}/>,
            [FunctionSuggestionType.FUNCTION_COMBINATION]: <IconNote color="#70ffb2" size={16}/>,
            [FunctionSuggestionType.REF_OBJECT]: <IconVariable color="#FFBE0B" size={16}/>,
            [FunctionSuggestionType.VALUE]: <IconCircleDot color="#D90429" size={16}/>,
            [FunctionSuggestionType.DATA_TYPE]: <IconCircleDot color="#D90429" size={16}/>,
        }

        const children: React.ReactNode = <>
            {suggestion.icon ?? iconMap[suggestion.type]}
            {
                suggestion.type === FunctionSuggestionType.REF_OBJECT ? (
                    <ReferenceBadgeComponent value={suggestion.value as ReferenceValue}/>
                ) : suggestion.type === FunctionSuggestionType.VALUE ? (
                    <Text>{String((suggestion.value as LiteralValue).value)}</Text>
                ) : suggestion.type === FunctionSuggestionType.FUNCTION ? (
                    <Text>{String(suggestion.displayText)}</Text>
                ) : null
            }
        </>

        let groupLabel: string | undefined = staticGroupLabels[suggestion.type]

        if (suggestion.type === FunctionSuggestionType.FUNCTION || suggestion.type === FunctionSuggestionType.FUNCTION_COMBINATION) {
            const runtimeIdentifier = suggestion.value.__typename === "NodeFunction"
                ? suggestion.value.functionDefinition?.identifier
                : undefined


            if (runtimeIdentifier) {
                const [runtime, pkg] = runtimeIdentifier.split("::")
                if (runtime && pkg) {
                    groupLabel = `${runtime}::${pkg}`
                }
            }
        }

        return {
            children,
            insertMode: "replace",
            valueData: {
                ...suggestion,
                icon: ""
            },
            value: suggestion.value,
            groupBy: groupLabel,
        };
    })
}
