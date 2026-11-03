import type {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {useValueExtractionAction} from "@edition/flow/components/FlowWorkerProvider";
import {isVoidType} from "@edition/datatype/utils/DataType.isVoidType.util";
import React from "react";

export const useDefaultValue = (type?: string): LiteralValue | null => {
    const {execute, hydrated} = useValueExtractionAction()

    const [value, setValue] = React.useState<LiteralValue | null>(null)

    React.useEffect(() => {
        if (!type || isVoidType(type)) {
            setValue(null)
            return
        }
        if (!hydrated) return

        let cancelled = false

        execute({type}).then(result => {
            if (cancelled) return
            setValue(result ?? null)
        })

        return () => {
            cancelled = true
        }
    }, [type, hydrated, execute])

    return value
}
