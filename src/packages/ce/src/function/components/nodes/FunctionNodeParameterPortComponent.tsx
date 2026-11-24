import {useReactFlow} from "@xyflow/react";
import React, {memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {Button, useService, useStore} from "@code0-tech/pictor";
import {IconPlus} from "@tabler/icons-react";
import {
    Flow,
    InlineReferenceValue,
    LiteralValue,
    NodeFunction,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {SignatureSchema} from "@code0-tech/triangulum";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";
import {parameterNodeSuggestions} from "@edition/flow/utils/Flow.parameterNodeSuggestions.util";
import {
    parameterValueOfSuggestion,
    SuggestionOrigin
} from "@edition/flow/utils/Flow.parameterValueOfSuggestion.util";
import {setSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";

export interface FunctionNodeParameterPortComponentProps {
    flowId: Flow["id"]
    nodeId: NodeFunction["id"]
    parameterIndex: number
    schema: SignatureSchema["parameters"]
    size: number
}

export const FunctionNodeParameterPortComponent: React.FC<FunctionNodeParameterPortComponentProps> = memo((props) => {

    const {flowId, nodeId, parameterIndex, schema, size} = props

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const reactFlow = useReactFlow()

    const functionSuggestions = useFunctionSuggestions()

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, nodeId),
        [flowService, flowStore, flowId, nodeId]
    )

    const definition = React.useMemo(
        () => functionService.getById(node?.functionDefinition?.id),
        [functionService, functionStore, node?.functionDefinition?.id]
    )

    const parameterSchema = React.useMemo(
        () => schema?.[parameterIndex],
        [schema, parameterIndex]
    )

    const input = parameterSchema?.schema?.input
    const isList = input !== "sub-flow"
    const signaturePrefix = input === "list-sub-flow" ? "sub_flow" : "item"

    // the only dialog that mixes both sources: triangulum's own suggestions when it has any, the whole
    // function catalogue otherwise - and that fallback is exactly what makes a picked function a sub flow
    const ownSuggestions = React.useMemo(
        () => parameterNodeSuggestions(parameterSchema),
        [parameterSchema]
    )

    const origin: SuggestionOrigin = ownSuggestions.length > 0 ? "parameter" : "catalogue"

    const suggestions = React.useMemo(
        () => ownSuggestions.length > 0 ? ownSuggestions : functionSuggestions,
        [ownSuggestions, functionSuggestions]
    )

    const onSuggestionSelect = React.useCallback(async (suggestion: NodeFunction | SubFlowValue | ReferenceValue | LiteralValue) => {
        if (suggestion.__typename === "LiteralValue") return

        const created = parameterValueOfSuggestion(flowService, flowId, nodeId ?? null, suggestion, origin)
        if (!created) return

        const {value, addedNodeId} = created
        const emptySubFlow = value.__typename === "SubFlowValue" && !value.startingNodeId

        if (!isList) {
            await flowService.setParameterValue(flowId, nodeId, parameterIndex, value, definition)
            const selectedNodeId = addedNodeId ?? (emptySubFlow ? `${nodeId}-${parameterIndex}` : undefined)
            if (selectedNodeId) setSelectedFunctionNode(selectedNodeId, reactFlow)
            return
        }

        const currentValue = node?.parameters?.nodes?.[parameterIndex]?.value
        const currentLiteral = currentValue?.__typename === "LiteralValue" ? currentValue : undefined
        const currentEntries = Array.isArray(currentLiteral?.value) ? currentLiteral.value : []
        const currentReferences = currentLiteral?.references ?? []

        const taken = new Set(currentReferences.map(reference => reference!.signature))
        const signature = Array.from({length: taken.size + 1}, (_, index) => `${signaturePrefix}_${index}`)
            .find(candidate => !taken.has(candidate))!

        await flowService.setParameterValue(flowId, nodeId, parameterIndex, {
            __typename: "LiteralValue",
            value: [...currentEntries, `\${${signature}}`],
            references: [...currentReferences, {
                __typename: "InlineReferenceValue",
                signature: signature,
                value: value
            } as InlineReferenceValue]
        } as LiteralValue, definition)

        const selectedNodeId = addedNodeId ?? (emptySubFlow ? `${nodeId}-${parameterIndex}-${signature}` : undefined)
        if (selectedNodeId) setSelectedFunctionNode(selectedNodeId, reactFlow)
    }, [flowService, flowId, nodeId, parameterIndex, definition, isList, origin, signaturePrefix, node, reactFlow])

    return <>
        <SuggestionDialogComponent suggestions={suggestions}
                                   flowId={flowId}
                                   nodeId={nodeId}
                                   parameterIndex={parameterIndex}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={onSuggestionSelect}
                                   onOpenChange={setSuggestionDialogOpen}/>

        <Button data-qa-selector={"flow-builder-node-parameter-port"}
                color={"secondary"}
                paddingSize={"xxs"}
                style={{borderRadius: "50%", lineHeight: 0, width: size, height: size, padding: 0}}
                onClick={() => setSuggestionDialogOpen(true)}>
            <IconPlus size={11}/>
        </Button>
    </>
})
