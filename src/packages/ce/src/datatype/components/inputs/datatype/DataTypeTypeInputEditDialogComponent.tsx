import React, {useEffect, useMemo, useState} from "react"
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    Flex,
    Text,
    useService,
    useStore
} from "@code0-tech/pictor";
import {IconX} from "@tabler/icons-react";
import {Editor} from "@code0-tech/pictor/dist/components/editor/Editor";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {LiteralValue} from "@code0-tech/sagittarius-graphql-types";
import {useDebounce} from "use-debounce";
import {useValueExtractionAction} from "@edition/flow/components/FlowWorkerProvider";
import {DataTypeTypeEditorInput} from "@edition/datatype/components/inputs/datatype/DataTypeTypeEditorInput";

export interface DataTypeJSONInputEditDialogComponentProps {
    open: boolean
    value: string | null
    onOpenChange?: (open: boolean) => void
    onTypeChange?: (type: string | null) => void
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
                    let k = 0;
                    let bLevel = 0;
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
                    let k = 0;
                    let bLevel = 0;
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
            if (!line) {
                i++;
                continue;
            }
            const currentIndent = getIndent(lines[i]);

            const propMatch = line.match(/^(\w+)\s+(contains|is)\b(.*)$/i);
            if (propMatch) {
                const key = propMatch[1];
                const keyword = propMatch[2].toLowerCase();
                let rest = propMatch[3].trim();
                let value = "";

                if (rest.startsWith("(")) {
                    let combined = rest;
                    let j = i;
                    while (j < lines.length) {
                        const openIdx = combined.indexOf("(");
                        const closingIdx = findClosingBracket(combined, openIdx);
                        if (closingIdx !== -1) {
                            value = transform(combined.substring(openIdx + 1, closingIdx));
                            i = j;
                            break;
                        }
                        j++;
                        if (j < lines.length) combined += " " + lines[j].trim();
                    }
                } else {
                    let subLines: string[] = [];
                    let j = i + 1;
                    while (j < lines.length) {
                        if (lines[j].trim() === "") {
                            j++;
                            continue;
                        }
                        if (getIndent(lines[j]) > currentIndent) {
                            subLines.push(lines[j]);
                            j++;
                        } else break;
                    }
                    if (subLines.length > 0) {
                        value = parseLines(subLines);
                        if (rest) {
                            const restTransformed = transform(rest);
                            value = restTransformed + (value.trim().startsWith("&") || value.trim().startsWith("|") ? "" : " & ") + value;
                        }
                        i = j - 1;
                    } else {
                        value = transform(rest);
                    }
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
    const [humanValue, setHumanValue] = useState(value)
    const [debouncedHumanValue] = useDebounce(humanValue ?? "", 300);
    const {execute} = useValueExtractionAction()
    const [valueFromType, setValueFromType] = useState<LiteralValue>({} as LiteralValue)

    const dataTypes = useMemo(
        () => dataTypeService.values(),
        [dataTypeStore]
    )

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
                                <DataTypeTypeEditorInput value={value}
                                                         key={"type-editor"}
                                                         onChange={human => setHumanValue(human)}/>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </Layout>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    )
}