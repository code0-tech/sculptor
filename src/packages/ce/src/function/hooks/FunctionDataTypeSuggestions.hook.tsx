import React from "react";
import type {DataTypeIdentifier} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {DFlowSuggestion, DFlowSuggestionType} from "@edition/function/components/FunctionSuggestion.view";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

export const useDataTypeSuggestions = (dataTypeIdentifier?: DataTypeIdentifier): DFlowSuggestion[] => {
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
            type: DFlowSuggestionType.DATA_TYPE,
            displayText: [nextDataType.name!![0]?.content!],
            /*@ts-ignore*/
            value: nextDataType.json,
        }))
    }, [dataType, dataTypeService, dataTypeStore])
}
