import type {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {useService, useStore} from "@code0-tech/pictor";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {useValueExtractionAction} from "@edition/flow/components/FlowWorkerProvider";
import {isVoidType} from "@edition/datatype/utils/DataType.isVoidType.util";
import React from "react";

export const useDefaultValue = (type?: string): LiteralValue | null => {
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const {execute} = useValueExtractionAction()

    const [value, setValue] = React.useState<LiteralValue | null>(null)

    const dataTypes = React.useMemo(
        () => dataTypeService.values(),
        [dataTypeStore, dataTypeService]
    )

    React.useEffect(() => {
        if (!type || isVoidType(type)) {
            setValue(null)
            return
        }

        let cancelled = false

        execute({type, dataTypes}).then(result => {
            if (cancelled) return
            setValue(result ?? null)
        })

        return () => {
            cancelled = true
        }
    }, [type, dataTypes.length])

    return value
}
