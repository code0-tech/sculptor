import {Node, NodeProps, useReactFlow} from "@xyflow/react";
import React, {memo} from "react";
import "./FunctionNodeComponent.style.scss";
import {FunctionNodeComponentProps} from "./FunctionNodeComponent";
import {Button, Flex, useService, useStore} from "@code0-tech/pictor";
import {IconPlus} from "@tabler/icons-react";
import {
    InlineReferenceValue,
    LiteralValue,
    NodeFunction,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {FunctionNodeHandlesComponent} from "@edition/function/components/nodes/FunctionNodeHandlesComponent";
import {SuggestionDialogComponent} from "@edition/function/components/suggestion/SuggestionDialogComponent";
import {useFunctionSuggestions} from "@edition/function/hooks/Function.suggestion.hook";
import {exactSuggestions} from "@edition/datatype/utils/DataType.exactSuggestions.util";
import {ownSuggestionCertainties} from "@edition/datatype/utils/DataType.suggestionCertainties.util";
import {listNodeSuggestions} from "@edition/datatype/components/inputs/list/DataTypeListInput.util";
import {setSelectedFunctionNode} from "@edition/function/hooks/FunctionNode.selected.hook";

export type FunctionNodeSubFlowSlotComponentProps = NodeProps<Node<FunctionNodeComponentProps>>

export const FunctionNodeSubFlowSlotComponent: React.FC<FunctionNodeSubFlowSlotComponentProps> = memo((props) => {

    const {data, id} = props
    const {flowId, parentNodeId, parameterIndex, schema} = data

    const flowService = useService(FlowService)
    const flowStore = useStore(FlowService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const [suggestionDialogOpen, setSuggestionDialogOpen] = React.useState(false)
    const reactFlow = useReactFlow()

    const functionSuggestions = useFunctionSuggestions()

    const node = React.useMemo(
        () => flowService.getNodeById(flowId, parentNodeId),
        [flowService, flowStore, flowId, parentNodeId]
    )

    const definition = React.useMemo(
        () => functionService.getById(node?.functionDefinition?.id),
        [functionService, functionStore, node?.functionDefinition?.id]
    )

    const parameterSchema = React.useMemo(
        () => schema?.[parameterIndex ?? 0],
        [schema, parameterIndex]
    )

    const isList = parameterSchema?.schema?.input !== "sub-flow"
    const signaturePrefix = parameterSchema?.schema?.input === "list-sub-flow" ? "sub_flow" : "item"

    const suggestions = React.useMemo(() => {
        const parameterSuggestions = (parameterSchema?.schema?.suggestions ?? []) as (NodeFunction | SubFlowValue | ReferenceValue | LiteralValue)[]

        const available = isList
            ? listNodeSuggestions(parameterSchema, parameterSuggestions)
            : exactSuggestions(parameterSuggestions, ownSuggestionCertainties(parameterSchema))
                .filter(suggestion => suggestion.__typename === "SubFlowValue"
                    || suggestion.__typename === "NodeFunction"
                    || suggestion.__typename === "ReferenceValue")

        return available.length > 0 ? available : functionSuggestions
    }, [parameterSchema, isList, functionSuggestions])

    const onSuggestionSelect = React.useCallback(async (suggestion: NodeFunction | SubFlowValue | ReferenceValue | LiteralValue) => {
        if (parameterIndex == null) return

        const addedNodeId = suggestion.__typename === "NodeFunction"
            ? flowService.addPreviousNodeById(flowId, parentNodeId, suggestion)
            : undefined

        if (suggestion.__typename === "NodeFunction" && !addedNodeId) return

        const value = (addedNodeId
            ? {__typename: "ReferenceValue", nodeFunctionId: addedNodeId}
            : suggestion) as SubFlowValue | ReferenceValue | LiteralValue

        const emptySubFlow = value.__typename === "SubFlowValue" && !value.startingNodeId

        if (!isList) {
            await flowService.setParameterValue(flowId, parentNodeId, parameterIndex, value, definition)
            const selectedNodeId = addedNodeId ?? (emptySubFlow ? `${parentNodeId}-${parameterIndex}` : undefined)
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

        await flowService.setParameterValue(flowId, parentNodeId, parameterIndex, {
            __typename: "LiteralValue",
            value: [...currentEntries, `\${${signature}}`],
            references: [...currentReferences, {
                __typename: "InlineReferenceValue",
                signature: signature,
                value: value as SubFlowValue | ReferenceValue
            } as InlineReferenceValue]
        } as LiteralValue, definition)

        const selectedNodeId = addedNodeId ?? (emptySubFlow ? `${parentNodeId}-${parameterIndex}-${signature}` : undefined)
        if (selectedNodeId) setSelectedFunctionNode(selectedNodeId, reactFlow)
    }, [flowService, flowId, parentNodeId, parameterIndex, definition, isList, signaturePrefix, node, reactFlow])

    return <>
        <SuggestionDialogComponent suggestions={suggestions}
                                   flowId={flowId}
                                   nodeId={parentNodeId}
                                   parameterIndex={parameterIndex}
                                   open={suggestionDialogOpen}
                                   onSuggestionSelect={onSuggestionSelect}
                                   onOpenChange={setSuggestionDialogOpen}/>
        <Flex align={"center"} justify={"center"} w={"100%"} h={"100%"} style={{position: "relative"}}>
            <FunctionNodeHandlesComponent isParameter/>
            <Button data-qa-selector={"flow-builder-node-sub-flow-slot"}
                    key={id}
                    color={"secondary"}
                    paddingSize={"xxs"}
                    w={"100%"}
                    h={"100%"}
                    onClick={() => setSuggestionDialogOpen(true)}>
                <IconPlus size={13}/>
            </Button>
        </Flex>
    </>
})
