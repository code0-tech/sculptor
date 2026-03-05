import React from "react";
import type {
    DataTypeIdentifier,
    DataTypeRulesItemOfCollectionConfig,
    DataTypeRulesNumberRangeConfig
} from "@code0-tech/sagittarius-graphql-types";
import {DFlowSuggestion, DFlowSuggestionType} from "@edition/function/components/FunctionSuggestion.view";
import {DFlowDataTypeReactiveService, useService, useStore} from "@code0-tech/pictor";

export const useValueSuggestions = (dataTypeIdentifier?: DataTypeIdentifier): DFlowSuggestion[] => {
    const dataTypeService = useService(DFlowDataTypeReactiveService)
    const dataTypeStore = useStore(DFlowDataTypeReactiveService)

    const dataType = React.useMemo(() => (
        dataTypeIdentifier ? dataTypeService?.getDataType(dataTypeIdentifier) : undefined
    ), [dataTypeIdentifier, dataTypeService, dataTypeStore])

    return React.useMemo(() => {
        if (!dataType) return []

        const suggestions: DFlowSuggestion[] = []
        dataType.rules?.nodes?.forEach(rule => {
            if (rule?.variant === "ITEM_OF_COLLECTION") {
                (rule.config as DataTypeRulesItemOfCollectionConfig)!!.items?.forEach(value => {
                    suggestions.push({
                        path: [],
                        type: DFlowSuggestionType.VALUE,
                        displayText: [value.toString()],
                        value: {
                            __typename: "LiteralValue",
                            value: value
                        },
                    })
                })
            } else if (rule?.variant === "NUMBER_RANGE") {
                const config: DataTypeRulesNumberRangeConfig = rule.config as DataTypeRulesNumberRangeConfig
                if (config.from === null || config.from === undefined) return
                if (config.to === null || config.to === undefined) return

                for (let i = config.from; i <= config.to; i += ((config.steps ?? 1) <= 0 ? 1 : (config.steps ?? 1))) {
                    suggestions.push({
                        path: [],
                        type: DFlowSuggestionType.VALUE,
                        displayText: [i.toString() ?? ""],
                        value: {
                            __typename: "LiteralValue",
                            value: String(i)
                        },
                    })
                }
            }
        })

        return suggestions
    }, [dataType])
}
