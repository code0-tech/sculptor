import React from "react";
import {ReferenceValue} from "@code0-tech/sagittarius-graphql-types";
import {DataTypeInputNodeBadge} from "./DataTypeInputNodeBadge";
import {DataTypeInputReferenceBadge} from "./DataTypeInputReferenceBadge";
import {DataTypeInputProps} from "./DataTypeInput";
import {InputSyntaxSegment, MenuItem, Text, TextInput, useService} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowTypeService";
import {useSuggestions} from "@edition/function/hooks/DFlowSuggestion.hook";
import {DFlowSuggestionMenuFooter} from "@edition/function/components/DFlowSuggestionMenuFooter";
import {toInputSuggestions} from "@edition/function/components/DFlowSuggestionMenu.util";
import {DFlowSuggestion} from "@edition/function/components/DFlowSuggestion.view";

export type DataTypeTextInputProps = DataTypeInputProps

export const splitTextAndObjects = (input: string) => {
    const result: (string | Record<string, any>)[] = []

    let currentText = ""
    let currentObject = ""
    let braceLevel = 0
    let inString: '"' | "'" | "" = ""
    let escaped = false

    const pushText = () => {
        if (currentText) result.push(currentText)
        currentText = ""
    }

    const parseObject = (value: string) => {
        try {
            return JSON.parse(value)
        } catch {
            try {
                return JSON.parse(
                    value
                        .replace(/'/g, `"`)
                        .replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, `$1"$2"$3`)
                )
            } catch {
                return {}
            }
        }
    }

    input.split("").forEach(char => {
        if (braceLevel > 0) {
            currentObject += char

            if (escaped) {
                escaped = false
                return
            }

            if (char === "\\") {
                escaped = true
                return
            }

            if (inString) {
                if (char === inString) inString = ""
                return
            }

            if (char === `"` || char === `'`) {
                inString = char as any
                return
            }

            if (char === "{") braceLevel++
            if (char === "}") braceLevel--

            if (braceLevel === 0) {
                result.push(parseObject(currentObject))
                currentObject = ""
            }

            return
        }

        if (char === "{") {
            pushText()
            braceLevel = 1
            currentObject = "{"
            return
        }

        currentText += char
    })

    pushText()
    return result
}

export const DataTypeTextInput: React.FC<DataTypeTextInputProps> = (props) => {

    const {flowId, nodeId, parameterId, ...rest} = props

    const functionService = useService(FunctionService)
    const flowService = useService(FlowService)
    const flowTypeService = useService(FlowTypeService)

    const flow = React.useMemo(() => {
        return flowService.getById(flowId)
    }, [flowService, flowId])

    const suggestions = rest.suggestions || useSuggestions(flowId, nodeId, parameterId)

    const transformSyntax = React.useCallback((value: string | null): InputSyntaxSegment[] => {

        const textValue = (value === null || value === undefined ? value : String(value ?? ""))!
        let cursor = 0

        const buildTextSegment = (text: string): InputSyntaxSegment => {
            const segment = {
                type: "text",
                value: text,
                start: cursor,
                end: cursor + text.length,
                visualLength: text.length,
                content: text,
            } as InputSyntaxSegment
            cursor += text.length
            return segment
        }

        const buildBlockSegment = (node: React.ReactNode, value: Record<string, any>): InputSyntaxSegment => {
            const segment = {
                type: "block",
                value: value,
                start: cursor,
                end: cursor + JSON.stringify(value).length,
                visualLength: 1,
                content: node,
            } as InputSyntaxSegment
            cursor += JSON.stringify(value).length
            return segment
        }

        return splitTextAndObjects(textValue).map(value => {

            if (typeof value !== "object") {
                return buildTextSegment(value)
            }

            if (value?.__typename === "NodeFunctionIdWrapper" || value?.__typename === "NodeFunction") {
                const node = value?.__typename === "NodeFunction" ? value : flowService.getNodeById(flowId, value.id)
                return buildBlockSegment(
                    <DataTypeInputNodeBadge value={value} flowId={flowId}
                                            definition={functionService.getById(node?.functionDefinition.id)}/>,
                    value
                )
            }

            if (value?.__typename === "ReferenceValue") {
                const node = (value as ReferenceValue).nodeFunctionId === "gid://sagittarius/NodeFunction/-1" ? flowTypeService.getById(flow?.type?.id) : functionService.getById(flowService.getNodeById(flowId, (value as ReferenceValue).nodeFunctionId)?.functionDefinition?.id)
                return buildBlockSegment(
                    <DataTypeInputReferenceBadge flowId={flowId} definition={node} value={value}/>,
                    value
                )
            }

            if (value?.__typename === "LiteralValue") {
                return buildTextSegment(value.value)
            }

            return buildTextSegment(value as any as string)
        })
    }, [functionService, flowService])

    return <TextInput suggestionsEmptyState={<MenuItem><Text>No suggestion found</Text></MenuItem>}
                      suggestionsFooter={<DFlowSuggestionMenuFooter/>}
                      filterSuggestionsByLastToken
                      enforceUniqueSuggestions
                      validationUsesSyntax
                      transformSyntax={transformSyntax}
                      suggestions={rest.suggestions ? rest.suggestions : toInputSuggestions(suggestions as DFlowSuggestion[])}
                      {...rest}

    />
}
