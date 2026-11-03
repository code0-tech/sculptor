import {getFlowValidation, getSignatureSchema, getTypeFromValue, getValueFromType} from "@code0-tech/triangulum";
import {InspectionSeverity} from "../../../../core/src/util/inspection";
import {getJsonSchemaFromType} from "../../../../core/src/util/json-schema";

const errorResult = (
    nodeId,
    parameterIndex,
    message,
    severity
) => ({
    nodeId: nodeId,
    parameterIndex: parameterIndex,
    type: severity === "error" ? InspectionSeverity.ERROR : InspectionSeverity.WARNING,
    message: [{
        code: "en-US",
        content: message
    }]
})

// A sub-flow that carries only a functionIdentifier has no NodeFunction of its own, so
// the generated source references it bare (`fn_std_text_concat`) instead of calling it --
// there is no argument position for getSignatureSchema to analyse. Promoting it to a real
// starting node emits a lambda at the argument position it belongs to, so its parameters
// are analysed in context: they resolve against the enclosing call and offer the lambda's
// own parameters (a loop's item/index) as references.
const subFlowOf = (node, parameterIndex, referenceSignature) => {
    const value = node?.parameters?.nodes?.[parameterIndex]?.value
    if (value?.__typename === "SubFlowValue") return value
    if (value?.__typename !== "LiteralValue") return undefined
    return (value.references ?? []).find(reference =>
        reference?.value?.__typename === "SubFlowValue"
        && (referenceSignature === undefined || reference.signature === referenceSignature))?.value
}

const freeNodeId = (flow) => {
    const indices = (flow?.nodes?.nodes ?? [])
        .map(node => Number(node?.id?.match(/NodeFunction\/(\d+)$/)?.[1] ?? 0))
    return `gid://sagittarius/NodeFunction/${Math.max(0, ...indices) + 1}`
}

const hydration = {
    dataTypes: [],
    functions: []
}

addEventListener("message", (event) => {
    const {id, action, payload} = event.data;
    let result;

    if (action === 'hydrate') {
        hydration.dataTypes = payload.dataTypes ?? [];
        hydration.functions = payload.functions ?? [];
        return;
    }

    const {dataTypes, functions} = hydration;

    try {
        switch (action) {
            case 'validation':
                result = getFlowValidation(payload.flow, functions, dataTypes)
                    .diagnostics.map(diagnostic =>
                        errorResult(diagnostic.nodeId, diagnostic.parameterIndex, diagnostic.message, diagnostic.severity));
                break;
            case 'value_suggestions':
                result = [];
                break;
            case 'reference_suggestions':
                result = [];
                break;
            case 'node_suggestions':
                result = [];
                break;
            case 'node_type_extraction':
                result = {};
                break;
            case 'type_extraction':
                result = getTypeFromValue(payload.value, dataTypes);
                break;
            case 'value_extraction':
                result = getValueFromType(payload.type, dataTypes);
                break;
            case 'json_schema':
                result = getJsonSchemaFromType(payload.type, dataTypes);
                break;
            case 'type_variant':
                result = 0;
                break;
            case 'sub_flow_schema': {
                const flow = structuredClone(payload.flow);
                const parentNode = flow?.nodes?.nodes?.find(node => node?.id === payload.nodeId);
                const subFlow = subFlowOf(parentNode, payload.parameterIndex, payload.referenceSignature);

                if (!subFlow?.functionDefinition) {
                    result = undefined;
                    break;
                }

                const startingNodeId = freeNodeId(flow);
                subFlow.startingNodeId = startingNodeId;
                flow.nodes.nodes.push({
                    __typename: "NodeFunction",
                    id: startingNodeId,
                    functionDefinition: subFlow.functionDefinition,
                    parameters: {nodes: []}
                });

                result = getSignatureSchema(flow, dataTypes, functions, startingNodeId);
                break;
            }
            case 'flow_schemas':
                result = [
                    getSignatureSchema(payload.flow, dataTypes, functions),
                    ...(payload.flow?.nodes?.nodes ?? []).map(node =>
                        getSignatureSchema(payload.flow, dataTypes, functions, node?.id))
                ];
                break;
            case 'schema':
                // getSignatureSchema now returns a SignatureSchema ({nodeId, parameters, return}).
                // We forward the whole object so callers can associate parameters by nodeId;
                // the return schema is unused for now.
                result = getSignatureSchema(payload.flow, dataTypes, functions, payload.nodeId);
                break;
        }

        postMessage({id, data: result});
    } catch (error) {
        postMessage({id, error: error.message});
    }
});

