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
import {exactSuggestions} from "@edition/datatype/utils/DataType.exactSuggestions.util";
import {ownSuggestionCertainties} from "@edition/datatype/utils/DataType.suggestionCertainties.util";
import {
    listElementSuggestions,
    listNodeSuggestions
} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";
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

    const suggestions = React.useMemo(() => {
        const parameterSuggestions = (parameterSchema?.schema?.suggestions ?? []) as (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]

        const available = (input === "sub-flow"
            ? exactSuggestions(parameterSuggestions, ownSuggestionCertainties(parameterSchema))
            : input === "list-sub-flow"
                ? listNodeSuggestions(parameterSchema, parameterSuggestions)
                : listElementSuggestions(parameterSchema, parameterSuggestions))
            .filter(suggestion => suggestion.__typename === "SubFlowValue"
                || suggestion.__typename === "NodeFunction")

        return available.length > 0 ? available : functionSuggestions
    }, [parameterSchema, input, functionSuggestions])

    const onSuggestionSelect = React.useCallback(async (suggestion: NodeFunction | SubFlowValue | ReferenceValue | LiteralValue) => {
        const addedNodeId = suggestion.__typename === "NodeFunction"
            ? flowService.addPreviousNodeById(flowId, nodeId, suggestion)
            : undefined

        if (suggestion.__typename === "NodeFunction" && !addedNodeId) return

        const value = (addedNodeId
            ? {__typename: "ReferenceValue", nodeFunctionId: addedNodeId}
            : suggestion) as SubFlowValue | ReferenceValue | LiteralValue

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
                value: value as SubFlowValue | ReferenceValue
            } as InlineReferenceValue]
        } as LiteralValue, definition)

        const selectedNodeId = addedNodeId ?? (emptySubFlow ? `${nodeId}-${parameterIndex}-${signature}` : undefined)
        if (selectedNodeId) setSelectedFunctionNode(selectedNodeId, reactFlow)
    }, [flowService, flowId, nodeId, parameterIndex, definition, isList, signaturePrefix, node, reactFlow])

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
