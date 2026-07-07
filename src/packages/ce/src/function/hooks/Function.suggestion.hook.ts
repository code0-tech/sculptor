import {useService, useStore} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import React from "react";

export const useFunctionSuggestions = () => {

    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const functions = React.useMemo(
        () => functionService.values(),
        [functionStore, functionService]
    )

    const nodes: NodeFunction[] = React.useMemo(
        () => functions.map(funktion => ({
            __typename: "NodeFunction",
            id: "gid://sagittarius/NodeFunction/1",
            functionDefinition: funktion,
            parameters: {
                __typename: "NodeParameterConnection",
                nodes: (funktion.parameterDefinitions?.nodes || []).map(p => ({
                    __typename: "NodeParameter",
                    parameterDefinition: {
                        __typename: "ParameterDefinition",
                        id: p?.id,
                        identifier: p?.identifier
                    },
                    value: p?.defaultValue !== undefined && p?.defaultValue !== null ? {
                        __typename: "LiteralValue",
                        value: p.defaultValue.value
                    } : {
                        __typename: "LiteralValue",
                        value: null
                    }
                }))
            }
        })),
        [functions]
    )


    return React.useMemo(() => nodes.sort((a, b) => {
        const [rA, pA, fA] = a?.functionDefinition!!.identifier!!.split("::");
        const [rB, pB, fB] = b?.functionDefinition!!.identifier!!.split("::");

        const runtimeCmp = rA.localeCompare(rB);
        if (runtimeCmp !== 0) return runtimeCmp;

        const packageCmp = pA.localeCompare(pB);
        if (packageCmp !== 0) return packageCmp;

        return fA.localeCompare(fB);
    }), [nodes])

}