import React from "react";
import {NodeBadgeComponent} from "../../badges/NodeBadgeComponent";
import {ReferenceBadgeComponent} from "../../badges/ReferenceBadgeComponent";
import {DataTypeInputComponentProps} from "../DataTypeInputComponent";
import {InputSyntaxSegment, MenuItem, Text, TextInput, useService} from "@code0-tech/pictor";
import {FunctionService} from "@edition/function/services/Function.service";
import {FlowService} from "@edition/flow/services/Flow.service";
import {
    FunctionSuggestionMenuFooterComponent
} from "@edition/function/components/suggestion/FunctionSuggestionMenuFooterComponent";
import {toInputSuggestions} from "@edition/function/components/suggestion/FunctionSuggestionMenuComponent.util";

export type DataTypeTextInputComponentProps = DataTypeInputComponentProps

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

export const DataTypeTextInputComponent: React.FC<DataTypeTextInputComponentProps> = (props) => {

    const {flowId, nodeId, parameterIndex, ...rest} = props

    const functionService = useService(FunctionService)
    const flowService = useService(FlowService)

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
                return buildBlockSegment(
                    <NodeBadgeComponent value={value}/>,
                    value
                )
            }

            if (value?.__typename === "ReferenceValue") {
                return buildBlockSegment(
                    <ReferenceBadgeComponent value={value}/>,
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
                      suggestionsFooter={<FunctionSuggestionMenuFooterComponent/>}
                      filterSuggestionsByLastToken
                      enforceUniqueSuggestions
                      validationUsesSyntax
                      transformSyntax={transformSyntax}
                      suggestions={rest.suggestions ? rest.suggestions : toInputSuggestions([])}
                      {...rest}

    />
}
