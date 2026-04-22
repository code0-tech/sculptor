import {
    FunctionSuggestion,
    FunctionSuggestionType
} from "@edition/function/components/suggestion/FunctionSuggestionComponent.view";
import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import React from "react";
import {useNodeSuggestionsAction, useTypeVariantAction} from "@edition/flow/components/FlowWorkerProvider";
import {icon, IconString} from "@core/util/icons";
import {FALLBACK_FUNCTION_NAME} from "@core/util/fallback-translations";

export const useNodeSuggestions = (
    type?: string | null,
): FunctionSuggestion[] => {

    const functionStore = useStore(FunctionService)
    const functionService = useService(FunctionService)
    const dataTypeStore = useStore(DatatypeService)
    const dataTypeService = useService(DatatypeService)

    const [suggestions, setSuggestions] = React.useState<any[]>([])
    const [typeVariant, setTypeVariant] = React.useState<number | undefined>(undefined)
    const {execute} = useNodeSuggestionsAction()
    const variantAction = useTypeVariantAction()

    const functions = React.useMemo(() => functionService.values(), [functionStore]);
    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeStore]);

    React.useEffect(() => {

        if (type === null) return

        const timeout = setTimeout(() => {
            variantAction.execute({
                type: type as string,
                dataTypes
            }).then(value => {
                setTypeVariant(value?.[0]?.variant)
            })
        }, 200);

        return () => clearTimeout(timeout);

    }, [type, dataTypes])

    React.useEffect(() => {

        if (type !== null && typeVariant === undefined) return
        if (type !== null && typeVariant != 4) return

        const nodes = functionService.values().map(f => ({
            __typename: "NodeFunction",
            id: `gid://sagittarius/NodeFunction/1`,
            functionDefinition: {
                __typename: "FunctionDefinition",
                id: f.id,
                identifier: f.identifier,
            },
            parameters: {
                __typename: "NodeParameterConnection",
                nodes: (f.parameterDefinitions?.nodes || []).map(p => ({
                    __typename: "NodeParameter",
                    parameterDefinition: {
                        __typename: "ParameterDefinition",
                        id: p?.id,
                        identifier: p?.identifier
                    },
                    value: p?.defaultValue ? {
                        __typename: "LiteralValue",
                        value: p.defaultValue.value
                    } : null
                }))
            }
        }))

        setSuggestions(nodes)

    }, [type, typeVariant, functions, dataTypes])

    return React.useMemo(() => suggestions.sort((a, b) => {
        const [rA, pA, fA] = a?.functionDefinition!!.identifier!!.split("::");
        const [rB, pB, fB] = b?.functionDefinition!!.identifier!!.split("::");

        const runtimeCmp = rA.localeCompare(rB);
        if (runtimeCmp !== 0) return runtimeCmp;

        const packageCmp = pA.localeCompare(pB);
        if (packageCmp !== 0) return packageCmp;

        return fA.localeCompare(fB);
    }).map(suggestion => {

        const functionDefinition = functionService.getById(suggestion.functionDefinition?.id)
        return {
            path: [],
            type: FunctionSuggestionType.FUNCTION,
            displayText: [functionDefinition?.names?.[0]?.content ?? FALLBACK_FUNCTION_NAME],
            value: suggestion,
            icon: functionDefinition?.displayIcon || "",
            aliases: functionDefinition?.aliases?.map((a) => a.content).flatMap(a => a?.split(";") ?? ""),
            description: functionDefinition?.descriptions?.[0]?.content || "",
        }
    }), [suggestions]);
}
