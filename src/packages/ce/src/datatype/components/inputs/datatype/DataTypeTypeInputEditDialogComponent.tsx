import React, {useMemo, useState, useCallback, useEffect} from "react"
import {
    Badge,
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    hashToColor,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconX} from "@tabler/icons-react";
import {Editor, EditorTokenHighlights} from "@code0-tech/pictor/dist/components/editor/Editor";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {StreamLanguage} from "@codemirror/language";
import {tags as t} from "@lezer/highlight"
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {CompletionContext, CompletionResult} from "@codemirror/autocomplete";
import { useDebounce } from "use-debounce";
import {useValueExtractionAction} from "@edition/flow/components/FlowWorkerProvider";

export interface DataTypeJSONInputEditDialogComponentProps {
    open: boolean
    value: string | null
    onOpenChange?: (open: boolean) => void
    onTypeChange?: (type: string | null) => void
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

function humanToTs(input: string): string {
    if (!input) return ""

    const findClosingBracket = (s: string, start: number) => {
        let level = 1;
        for (let i = start + 1; i < s.length; i++) {
            if (s[i] === "(") level++;
            else if (s[i] === ")") level--;
            if (level === 0) return i;
        }
        return -1;
    };

    const getIndent = (line: string) => {
        const match = line.match(/^(\s*)/);
        return match ? match[0].length : 0;
    };

    const transform = (str: string): string => {
        if (!str || !str.trim()) return "";
        let result = str.trim();

        // Handle leading/trailing parentheses for the whole block
        if (result.startsWith("(") && result.endsWith(")")) {
            const innerMatch = findClosingBracket(result, 0);
            if (innerMatch === result.length - 1) {
                return `(${transform(result.substring(1, result.length - 1))})`;
            }
        }

        // 1. Handle Generics: NAME of (...) or NAME of TYPE
        let genericChanged = true;
        while (genericChanged) {
            genericChanged = false;
            const ofMatch = result.match(/(\b(?!is\b|contains\b|and\b|or\b)\w+\b)\s+of\s+/i);
            if (ofMatch && ofMatch.index !== undefined) {
                const start = ofMatch.index;
                const name = ofMatch[1];
                const afterOf = result.substring(start + ofMatch[0].length);

                if (afterOf.startsWith("(")) {
                    const end = findClosingBracket(afterOf, 0);
                    if (end !== -1) {
                        const inner = transform(afterOf.substring(1, end));
                        result = result.substring(0, start) + `${name}<${inner}>` + afterOf.substring(end + 1);
                        genericChanged = true;
                        continue;
                    }
                }
                const wordMatch = afterOf.match(/^(\w+)/);
                if (wordMatch) {
                    const word = wordMatch[1];
                    result = result.substring(0, start) + `${name}<${word}>` + afterOf.substring(start + ofMatch[0].length + word.length);
                    genericChanged = true;
                }
            }
        }

        let processed = "";
        let remaining = result;
        while (remaining.length > 0) {
            remaining = remaining.trim();
            if (!remaining) break;

            // Check for stand-alone operators first: or is, or contains, and is, and contains
            const opSpecialMatch = remaining.match(/^(and|or)\s+(is|contains)\b/i);
            if (opSpecialMatch) {
                const op = opSpecialMatch[1].toLowerCase() === "and" ? "&" : "|";
                const keyword = opSpecialMatch[2].toLowerCase();
                let after = remaining.substring(opSpecialMatch[0].length).trim();
                let val = "";
                if (after.startsWith("(")) {
                    const end = findClosingBracket(after, 0);
                    if (end !== -1) {
                        val = transform(after.substring(1, end));
                        processed += ` ${op} ${keyword === "contains" ? `{ ${val} }` : (val.includes("&") || val.includes("|") ? `(${val})` : val)}`;
                        remaining = after.substring(end + 1);
                    } else {
                        val = transform(after.substring(1));
                        processed += ` ${op} ${keyword === "contains" ? `{ ${val} }` : val}`;
                        remaining = "";
                    }
                } else {
                    let k = 0; let bLevel = 0;
                    for (; k < after.length; k++) {
                        if (after[k] === "(" || after[k] === "<" || after[k] === "{") bLevel++;
                        else if (after[k] === ")" || after[k] === ">" || after[k] === "}") bLevel--;
                        else if (bLevel === 0) {
                            if (/^\s+(and|or)\b/i.test(after.substring(k))) break;
                            if (/^\s+(\b(?!is\b|contains\b|and\b|or\b)\w+\b)\s+(is|contains)\b/i.test(after.substring(k))) break;
                        }
                    }
                    val = transform(after.substring(0, k).trim());
                    processed += ` ${op} ${keyword === "contains" ? `{ ${val} }` : val}`;
                    remaining = after.substring(k);
                }
            }

            // Property: key contains / key is (exclude keywords from being keys)
            const propMatch = remaining.match(/^(\b(?!is\b|contains\b|and\b|or\b)\w+\b)\s+(contains|is)\b/i);
            if (propMatch) {
                const key = propMatch[1];
                const keyword = propMatch[2].toLowerCase();
                let after = remaining.substring(propMatch[0].length).trim();
                let val = "";
                if (after.startsWith("(")) {
                    const end = findClosingBracket(after, 0);
                    if (end !== -1) {
                        val = transform(after.substring(1, end));
                        if (processed.length > 0 && !/[{&|]\s*$/.test(processed.trim())) processed += ", ";
                        processed += keyword === "contains" ? `${key}: { ${val} }` : `${key}: ${val.includes("&") || val.includes("|") ? `(${val})` : val}`;
                        remaining = after.substring(end + 1);
                    } else {
                        val = transform(after.substring(1));
                        if (processed.length > 0 && !/[{&|]\s*$/.test(processed.trim())) processed += ", ";
                        processed += keyword === "contains" ? `${key}: { ${val} }` : `${key}: ${val}`;
                        remaining = "";
                    }
                } else {
                    let k = 0; let bLevel = 0;
                    for (; k < after.length; k++) {
                        if (after[k] === "(" || after[k] === "<" || after[k] === "{") bLevel++;
                        else if (after[k] === ")" || after[k] === ">" || after[k] === "}") bLevel--;
                        else if (bLevel === 0) {
                            if (/^\s+(and|or)\b/i.test(after.substring(k))) break;
                            if (/^\s+(\b(?!is\b|contains\b|and\b|or\b)\w+\b)\s+(is|contains)\b/i.test(after.substring(k))) break;
                        }
                    }
                    val = transform(after.substring(0, k).trim());
                    if (processed.length > 0 && !/[{&|]\s*$/.test(processed.trim())) processed += ", ";
                    processed += keyword === "contains" ? `${key}: { ${val} }` : `${key}: ${val}`;
                    remaining = after.substring(k);
                }
            }

            // Fallback for types or remaining keywords
            const word = remaining.match(/^([a-zA-Z0-9_<>]+)/);
            if (word) {
                processed += word[1];
                remaining = remaining.substring(word[1].length);
                continue;
            }
            if (remaining[0] === "(" || remaining[0] === ")") {
                processed += remaining[0];
                remaining = remaining.substring(1);
                continue;
            }
            processed += remaining[0];
            remaining = remaining.substring(1);
        }
        return processed;
    };

    const parseLines = (lines: string[]): string => {
        let result = "";
        let i = 0;

        while (i < lines.length) {
            let line = lines[i].trim();
            if (!line) { i++; continue; }
            const currentIndent = getIndent(lines[i]);

            const propMatch = line.match(/^(\w+)\s+(contains|is)\b(.*)$/i);
            if (propMatch) {
                const key = propMatch[1];
                const keyword = propMatch[2].toLowerCase();
                let rest = propMatch[3].trim();
                let value = "";

                if (rest.startsWith("(")) {
                    let combined = rest; let j = i;
                    while (j < lines.length) {
                        const openIdx = combined.indexOf("(");
                        const closingIdx = findClosingBracket(combined, openIdx);
                        if (closingIdx !== -1) {
                            value = transform(combined.substring(openIdx + 1, closingIdx));
                            i = j; break;
                        }
                        j++;
                        if (j < lines.length) combined += " " + lines[j].trim();
                    }
                } else {
                    let subLines: string[] = []; let j = i + 1;
                    while (j < lines.length) {
                        if (lines[j].trim() === "") { j++; continue; }
                        if (getIndent(lines[j]) > currentIndent) { subLines.push(lines[j]); j++; }
                        else break;
                    }
                    if (subLines.length > 0) {
                        value = parseLines(subLines);
                        if (rest) {
                             const restTransformed = transform(rest);
                             value = restTransformed + (value.trim().startsWith("&") || value.trim().startsWith("|") ? "" : " & ") + value;
                        }
                        i = j - 1;
                    } else { value = transform(rest); }
                }

                if (result.length > 0 && !/[{&|]\s*$/.test(result.trim())) result += ", ";
                result += keyword === "contains" ? `${key}: { ${value} }` : `${key}: ${value}`;
            } else {
                const transformed = transform(line);
                if (result.length > 0 && !/[{&|]\s*$/.test(result.trim()) && !/^\s*[&|]/.test(transformed)) result += ", ";
                result += transformed;
            }
            i++;
        }
        return result;
    };

    const lines = input.split("\n");
    let final = parseLines(lines).replace(/\s+/g, " ").trim();
    if (final.includes(":") && !final.startsWith("{")) final = `{ ${final} }`;

    return final.replace(/\( /g, "(").replace(/ \)/g, ")")
                .replace(/: \s*:/g, ":").replace(/\{\s*:/g, "{")
                .replace(/&/g, " & ").replace(/\|/g, " | ")
                .replace(/,/g, ", ").replace(/\s+/g, " ").trim();
}

export const DataTypeTypeInputEditDialogComponent: React.FC<DataTypeJSONInputEditDialogComponentProps> = (props) => {
    const {
        open,
        value,
        onTypeChange,
        onOpenChange
    } = props

    const [editOpen, setEditOpen] = useState(open)
    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const [humanValue, setHumanValue] = useState(tsToHuman(value ?? ""))
    const [debouncedHumanValue] = useDebounce(humanValue, 300);
    const {execute} = useValueExtractionAction()
    const [valueFromType, setValueFromType] = useState<LiteralValue>({} as LiteralValue)

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

    const typeFromHumanLanguage = useMemo(
        () => {
            const type = humanToTs(debouncedHumanValue)
            onTypeChange?.(type)
            return type
        },
        [debouncedHumanValue]
    )

    useEffect(() => {
        execute({
            type: typeFromHumanLanguage,
            dataTypes: dataTypes
        }).then(val => {
            setValueFromType(val as any)
        })
    }, [typeFromHumanLanguage, dataTypes]);

    useEffect(() => {
        setEditOpen(open)
    }, [open])

    const typeLanguage = useMemo(() => {
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
    }, [typeSet])

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
                                { label: "and is", type: "operator" },
                                { label: "or is", type: "operator" },
                                { label: "and contains", type: "operator" },
                                { label: "or contains", type: "operator" }
                            ]
                        };
                    } else {
                        // Space after a word that is NOT a type (likely a property name) -> suggest 'is' / 'contains'
                        const typeExpectingKeywords = ["is", "contains", "or", "and", "of"];
                        if (!typeExpectingKeywords.includes(lastWord.toLowerCase())) {
                            return {
                                from: context.pos,
                                options: [
                                    { label: "is", type: "keyword" },
                                    { label: "contains", type: "keyword" }
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
                        { label: "and is", type: "operator" },
                        { label: "or is", type: "operator" },
                        { label: "and contains", type: "operator" },
                        { label: "or contains", type: "operator" }
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

    const typeEditor = useMemo(
        () => <Editor key={"type-editor"} onChange={(value) => {
            setHumanValue(value)
        }}
                      initialValue={tsToHuman(value!)}
                      suggestions={suggestions}
                      tokenHighlights={tokenHighlights}
                      tokenStyles={[
                          {tag: t.propertyName, color: hashToColor("property"), fontWeight: "bold"},
                      ]}
                      language={typeLanguage}
        />,
        [typeLanguage, suggestions, tokenHighlights]
    )

    return (
        <Dialog open={editOpen} onOpenChange={(open) => onOpenChange?.(open)}>
            <DialogPortal>
                <DialogOverlay/>
                <DialogContent aria-describedby="DFlowInputObjectEditDialog" onPointerDownOutside={e => {
                    const target = e.target as HTMLElement
                    if (target.closest("[data-slot=resizable-handle]") || target.closest("[data-slot=resizable-panel]")) {
                        e.preventDefault()
                    }
                }} w={"75%"} h={"75%"} style={{padding: "2px"}} forceMount>
                    <Layout layoutGap={0} showLayoutSplitter={false}
                            topContent={
                                <Flex style={{gap: ".7rem"}} p={0.7} justify={"space-between"} align={"center"}>
                                    <Text>{"Edit Type"}</Text>
                                    <DialogClose asChild>
                                        <Button variant={"filled"} color={"tertiary"} paddingSize={"xxs"}>
                                            <IconX size={13}/>
                                        </Button>
                                    </DialogClose>
                                </Flex>
                            }>
                        <ResizablePanelGroup style={{borderRadius: "1rem"}}>
                            <ResizablePanel color="secondary">
                                <Editor key={JSON.stringify(valueFromType)}
                                        language={"json"}
                                        initialValue={valueFromType.value}
                                        contentEditable={false}
                                        showTooltips={false}
                                        showValidation={false}
                                        readonly
                                />
                            </ResizablePanel>
                            <ResizableHandle/>
                            <ResizablePanel color="primary">
                                {typeEditor}
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </Layout>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    )
}