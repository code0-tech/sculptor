import {FunctionSuggestion, FunctionSuggestionType} from "./FunctionSuggestionComponent.view";
import React from "react";
import {IconCircleDot, IconCirclesRelation, IconFileFunctionFilled} from "@tabler/icons-react";
import {InputSuggestion, Text} from "@code0-tech/pictor";

export const toInputSuggestions = (suggestions: FunctionSuggestion[]): InputSuggestion[] => {

    const staticGroupLabels: Partial<Record<FunctionSuggestionType, string>> = {
        [FunctionSuggestionType.VALUE]: "Values",
        [FunctionSuggestionType.REF_OBJECT]: "Variables",
        [FunctionSuggestionType.DATA_TYPE]: "Datatypes",
    }

    return suggestions.map(suggestion => {

        const iconMap: Record<FunctionSuggestionType, React.ReactNode> = {
            [FunctionSuggestionType.FUNCTION]: <IconFileFunctionFilled color="#70ffb2" size={16}/>,
            [FunctionSuggestionType.FUNCTION_COMBINATION]: <IconFileFunctionFilled color="#70ffb2" size={16}/>,
            [FunctionSuggestionType.REF_OBJECT]: <IconCirclesRelation color="#FFBE0B" size={16}/>,
            [FunctionSuggestionType.VALUE]: <IconCircleDot color="#D90429" size={16}/>,
            [FunctionSuggestionType.DATA_TYPE]: <IconCircleDot color="#D90429" size={16}/>,
        }

        const children: React.ReactNode = <>
            {iconMap[suggestion.type]}
            <div>
                <Text display="flex" style={{gap: ".5rem"}}>
                    {suggestion.displayText.map((text, idx) => (
                        <span key={idx}>{text}</span>
                    ))}
                </Text>
            </div>
        </>

        let groupLabel: string | undefined = staticGroupLabels[suggestion.type]

        if (suggestion.type === FunctionSuggestionType.FUNCTION || suggestion.type === FunctionSuggestionType.FUNCTION_COMBINATION) {
            const runtimeIdentifier = suggestion.value.__typename === "NodeFunction"
                ? suggestion.value.functionDefinition?.runtimeFunctionDefinition?.identifier
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
            valueData: suggestion,
            value: suggestion.value,
            groupBy: groupLabel,
        };
    })
}
