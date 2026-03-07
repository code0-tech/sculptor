import React from "react";
import type {DataTypeIdentifier} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionSuggestion, FunctionSuggestionType} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

export const useDataTypeSuggestions = (dataTypeIdentifier?: DataTypeIdentifier): FunctionSuggestion[] => {
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)

    const dataType = React.useMemo(() => (
        dataTypeIdentifier ? dataTypeService?.getDataType(dataTypeIdentifier) : undefined
    ), [dataTypeIdentifier, dataTypeService, dataTypeStore])

    // @ts-ignore
    return React.useMemo(() => {
        if (!dataType || dataType.variant !== "DATA_TYPE") return []

        return dataTypeService.values().map(nextDataType => ({
            path: [],
            type: FunctionSuggestionType.DATA_TYPE,
            displayText: [nextDataType.name!![0]?.content!],
            /*@ts-ignore*/
            value: nextDataType.json,
        }))
    }, [dataType, dataTypeService, dataTypeStore])
}
