import {
    getFlowValidation,
    getNodeSuggestions,
    getReferenceSuggestions, getTypeFromValue,
    getTypesFromNode, getTypeVariant, getValueFromType,
    getValueSuggestions
} from "@code0-tech/triangulum";
import {InspectionSeverity} from "../../../../core/src/util/inspection";

const errorResult = (
    nodeId,
    parameterIndex,
    message
) => ({
    nodeId: nodeId,
    parameterIndex: parameterIndex,
    type: InspectionSeverity.ERROR,
    message: [{
        code: "en-US",
        content: message
    }]
})

addEventListener("message", (event) => {
    const { id, action, payload } = event.data;
    let result;

    try {
        switch (action) {
            case 'validation':
                result = getFlowValidation(payload.flow, payload.functions, payload.dataTypes)
                    .diagnostics.map(diagnostic =>
                        errorResult(diagnostic.nodeId, diagnostic.parameterIndex, diagnostic.message));
                break;
            case 'value_suggestions':
                result = getValueSuggestions(payload.type, payload.dataTypes);
                break;
            case 'reference_suggestions':
                result = getReferenceSuggestions(payload.flow, payload.nodeId, payload.parameterIndex, payload.functions, payload.dataTypes);
                break;
            case 'node_suggestions':
                result = getNodeSuggestions(payload.type, payload.functions, payload.dataTypes);
                break;
            case 'node_type_extraction':
                result = getTypesFromNode(payload.node, payload.functions, payload.dataTypes);
                break;
            case 'type_extraction':
                result = getTypeFromValue(payload.value, payload.dataTypes);
                break;
            case 'value_extraction':
                result = getValueFromType(payload.type, payload.dataTypes);
                break;
            case 'type_variant':
                result = getTypeVariant(payload.type, payload.dataTypes);
                break;
        }

        postMessage({ id, data: result });
    } catch (error) {
        postMessage({ id, error: error.message });
    }
});

