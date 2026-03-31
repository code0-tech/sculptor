import React, {useCallback, useMemo} from "react";
import {tags as t} from "@lezer/highlight";
import {Badge, hashToColor, useService, useStore} from "@code0-tech/pictor";
import {Editor, EditorInputProps, EditorTokenHighlights} from "@code0-tech/pictor/dist/components/editor/Editor";
import {StreamLanguage} from "@codemirror/language";
import {CompletionContext, CompletionResult} from "@codemirror/autocomplete";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";

export interface DataTypeTypeEditorInputProps extends EditorInputProps {
    value: string | null
}

export const DataTypeTypeEditorInput: React.FC<DataTypeTypeEditorInputProps> = (props) => {

    const {value, onChange, ...rest} = props

    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)

    const dataTypes = useMemo(
        () => dataTypeService.values(),
        [dataTypeStore]
    )
    const typeSet = useMemo(
        () => new Set(dataTypes.map(t => t.identifier)),
        [dataTypes]
    );

    const dataTypeMap = useMemo(
        () => new Map(dataTypes.map(t => [t.identifier, t])),
        [dataTypes]
    );

    const dataTypeOptions = useMemo(
        () => dataTypes.map(t => ({
            label: t.identifier!,
            type: "",
            apply: `${t.identifier}${t.genericKeys && t.genericKeys.length > 0 ? ` of (${t.genericKeys.join(", ")})` : ""}`
        })),
        [dataTypes]
    );

    const typeLanguage = useMemo(
        () => {
            return StreamLanguage.define({
                token(stream) {
                    if (stream.eatSpace()) return null;

                    // Keywords
                    if (stream.match(/\bis\b/)) {
                        return "keyword";
                    }
                    if (stream.match(/\bof\b/)) {
                        return "keyword";
                    }
                    if (stream.match(/\bcontains\b/)) {
                        return "keyword";
                    }

                    // Operators
                    if (stream.match(/\band\b/)) {
                        return "operator";
                    }
                    if (stream.match(/\bor\b/)) {
                        return "operator";
                    }

                    // Parentheses & Punctuation
                    if (stream.match(/[()]/)) return "punctuation";

                    // Word recognition with lookahead
                    const wordMatch = stream.match(/^[a-zA-Z0-9_-]+/, false);
                    if (wordMatch) {
                        // @ts-ignore
                        const word = wordMatch[0];

                        // Check if it's a known type
                        if (typeSet.has(word)) {
                            stream.match(/^[a-zA-Z0-9_-]+/);
                            return "typeName";
                        }

                        // Check if "is" or "contains" follows the word
                        const lookahead = stream.string.substring(stream.pos + word.length);
                        if (/^\s+(is|contains)\b/.test(lookahead)) {
                            stream.match(/^[a-zA-Z0-9_-]+/);
                            return "propertyName";
                        }

                        // Fallback: consume the word
                        stream.match(/^[a-zA-Z0-9_-]+/);
                        return "propertyName";
                    }

                    stream.next();
                    return null;
                }
            })
        },
        [typeSet]
    )

    const suggestions = useCallback(
        (context: CompletionContext): CompletionResult | null => {
            const word = context.matchBefore(/\w+/);
            const fullBefore = context.matchBefore(/.*?\s*$/);
            const textBefore = fullBefore ? fullBefore.text : "";
            const isExplicit = context.explicit;

            // Get current line and previous lines for context
            const line = context.state.doc.lineAt(context.pos);
            const isNewLine = line.from === context.pos;

            let prevLineText = "";
            let prevLineNumber = line.number - 1;
            while (prevLineNumber >= 1) {
                const l = context.state.doc.line(prevLineNumber);
                if (l.text.trim()) {
                    prevLineText = l.text.trim().toLowerCase();
                    break;
                }
                prevLineNumber--;
            }

            const isUnderContains = prevLineText.endsWith("contains");
            const isAfterContainsOnSameLine = textBefore.toLowerCase().trim().endsWith("contains");

            // 1. If we are after 'contains' (either same line or next line), don't suggest types
            if (isAfterContainsOnSameLine || (isNewLine && isUnderContains)) {
                return null;
            }

            // Helper to get the last word before potential trailing spaces
            const lastWordMatch = textBefore.trim().match(/(\w+)$/);
            const lastWord = lastWordMatch ? lastWordMatch[1] : "";
            const hasSpaceAfterLastWord = /\s$/.test(textBefore);

            // 2. If input is empty at the very start of the doc
            if (context.pos === 0 || (line.number === 1 && textBefore.trim() === "" && !isExplicit && !word)) {
                return {
                    from: context.pos,
                    options: dataTypeOptions
                };
            }

            // 3. If we just typed a word
            if (lastWord) {
                if (hasSpaceAfterLastWord) {
                    if (typeSet.has(lastWord)) {
                        // Space after recognized type -> suggest operators
                        return {
                            from: context.pos,
                            options: [
                                {label: "and is", type: "operator"},
                                {label: "or is", type: "operator"},
                                {label: "and contains", type: "operator"},
                                {label: "or contains", type: "operator"}
                            ]
                        };
                    } else {
                        // Space after a word that is NOT a type (likely a property name) -> suggest 'is' / 'contains'
                        const typeExpectingKeywords = ["is", "contains", "or", "and", "of"];
                        if (!typeExpectingKeywords.includes(lastWord.toLowerCase())) {
                            return {
                                from: context.pos,
                                options: [
                                    {label: "is", type: "keyword"},
                                    {label: "contains", type: "keyword"}
                                ]
                            };
                        }
                    }
                } else {
                    // Still touching the word -> continue showing types (filtering)
                    return {
                        from: word ? word.from : context.pos,
                        options: dataTypeOptions
                    };
                }
            }

            // 3. If we are after a keyword that expects a type
            const typeExpectingKeywords = ["is", "contains", "or", "and", "of"];
            if (typeExpectingKeywords.some(kw => textBefore.toLowerCase().trim().endsWith(kw)) && hasSpaceAfterLastWord) {
                return {
                    from: word ? word.from : context.pos,
                    options: dataTypeOptions
                };
            }

            // 4. If we are currently typing a word (and it's not a known type yet or we are filtering)
            if (word) {
                return {
                    from: word.from,
                    options: dataTypeOptions
                };
            }

            // 5. Default: if there is a space and we don't know what to do, show operators
            if (hasSpaceAfterLastWord) {
                return {
                    from: context.pos,
                    options: [
                        {label: "and is", type: "operator"},
                        {label: "or is", type: "operator"},
                        {label: "and contains", type: "operator"},
                        {label: "or contains", type: "operator"}
                    ]
                };
            }

            // 6. Explicit trigger
            if (isExplicit) {
                return {
                    from: context.pos,
                    options: dataTypeOptions
                };
            }

            return null;
        },
        [dataTypeOptions, typeSet]
    )

    const tokenHighlights: EditorTokenHighlights = useMemo(
        () => ({
            typeName: ({content}: { content: string }) => {
                const isRealType = dataTypeMap.has(content);
                return isRealType ? <Badge key={"Text"} color={hashToColor(content)} border>
                    {content}
                </Badge> : null
            },
        }),
        [dataTypeMap]
    )


    return <Editor key={"type-editor"}
                   onChange={onChange}
                   initialValue={tsToHuman(value!)}
                   suggestions={suggestions}
                   tokenHighlights={tokenHighlights}
                   tokenStyles={[
                       {tag: t.propertyName, color: hashToColor("property"), fontWeight: "bold"},
                   ]}
                   language={typeLanguage}
                   {...rest}
    />
}

function tsToHuman(ts: string): string {
    if (!ts) return ""

    const transform = (str: string, level: number = 0): string => {
        str = str.trim()
        const nextIndent = "  ".repeat(level + 1)

        // Handle Parentheses: ( ... )
        if (str.startsWith("(") && str.endsWith(")")) {
            const inner = str.slice(1, -1).trim();
            const transformedInner = transform(inner, level);
            return `(${transformedInner})`;
        }

        // Handle Objects: { key: value, ... } -> key is/contains ... and ...
        if (str.startsWith("{") && str.endsWith("}")) {
            const inner = str.slice(1, -1).trim()
            const pairs: string[] = []
            let bLevel = 0
            let lastIndex = 0
            for (let i = 0; i < inner.length; i++) {
                if (inner[i] === "{" || inner[i] === "(" || inner[i] === "<") bLevel++
                else if (inner[i] === "}" || inner[i] === ")" || inner[i] === ">") bLevel--
                else if (inner[i] === "," && bLevel === 0) {
                    pairs.push(inner.substring(lastIndex, i).trim())
                    lastIndex = i + 1
                }
            }
            pairs.push(inner.substring(lastIndex).trim())

            const transformedPairs = pairs.filter(p => p.length > 0).map(pair => {
                const colonIndex = pair.indexOf(":")
                if (colonIndex === -1) return transform(pair, level + 1)
                const key = pair.substring(0, colonIndex).trim()
                const value = pair.substring(colonIndex + 1).trim()

                if (value.startsWith("{")) {
                    return `\n${nextIndent}${key} contains ${transform(value, level + 1)}`
                } else {
                    const transformedVal = transform(value, level + 1)
                    return `\n${nextIndent}${key} is ${transformedVal}`
                }
            })

            return transformedPairs.join("")
        }

        // Handle Unions: A | B -> A or is B / A or contains B
        const unionParts = []
        let lastIdx = 0
        let bLevel = 0
        for (let i = 0; i < str.length; i++) {
            if (str[i] === "{" || str[i] === "<" || str[i] === "(") bLevel++
            else if (str[i] === "}" || str[i] === ">" || str[i] === ")") bLevel--
            else if (str[i] === "|" && bLevel === 0) {
                unionParts.push(str.substring(lastIdx, i).trim())
                lastIdx = i + 1
            }
        }
        unionParts.push(str.substring(lastIdx).trim())
        if (unionParts.length > 1) {
            return unionParts.map((s, idx) => {
                const t = transform(s, level)
                const prefix = idx === 0 ? "" : (s.trim().startsWith("{") ? " or contains " : " or is ")
                const content = (t.includes("\n") || (t.includes(" ") && !t.startsWith("("))) && !t.startsWith("\n") ? `(${t.trim()})` : t
                return `${prefix}${content}`
            }).join("")
        }

        // Handle Intersections: A & B -> A and is B / A and contains B
        const intersectParts = []
        lastIdx = 0
        bLevel = 0
        for (let i = 0; i < str.length; i++) {
            if (str[i] === "{" || str[i] === "<" || str[i] === "(") bLevel++
            else if (str[i] === "}" || str[i] === ">" || str[i] === ")") bLevel--
            else if (str[i] === "&" && bLevel === 0) {
                intersectParts.push(str.substring(lastIdx, i).trim())
                lastIdx = i + 1
            }
        }
        intersectParts.push(str.substring(lastIdx).trim())
        if (intersectParts.length > 1) {
            return intersectParts.map((s, idx) => {
                const t = transform(s, level)
                const prefix = idx === 0 ? "" : (s.trim().startsWith("{") ? " and contains " : " and is ")
                const content = (t.includes("\n") || (t.includes(" ") && !t.startsWith("("))) && !t.startsWith("\n") ? `(${t.trim()})` : t
                return `${prefix}${content}`
            }).join("")
        }

        // Handle Generics: NAME<TYPE> -> NAME of (TYPE)
        const genericMatch = str.match(/^(\w+)<(.+)>$/)
        if (genericMatch) {
            const name = genericMatch[1]
            const inner = genericMatch[2]
            const transformedInner = transform(inner, level)
            const needsParen = transformedInner.includes("\n") || (transformedInner.includes(" ") && !transformedInner.startsWith("("));
            return `${name} of ${needsParen ? `(${transformedInner.trim()})` : transformedInner}`
        }

        return str
    }

    return transform(ts).trim()
}