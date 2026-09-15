import React from "react"
import {LiteralValue, NodeFunction, NodeParameterValue, ReferenceValue, SubFlowValue} from "@code0-tech/sagittarius-graphql-types"
import {DataInput, ListInput, Schema} from "@code0-tech/triangulum"
import {Button, Text} from "@code0-tech/pictor"
import {IconPlus} from "@tabler/icons-react"
import {DataTypeInputComponent} from "@edition/datatype/components/inputs/DataTypeInputComponent"
import {DataTypeJSONInputFieldComponent} from "@edition/datatype/components/inputs/json/DataTypeJSONInputFieldComponent"

export interface DataTypeJSONInputFormComponentProps {
    schema: Schema | undefined
    valueSchema: Schema | undefined
    value: LiteralValue | null
    activePath: string[]
    onActivePathChange: (path: string[]) => void
    onValueChange: (path: string[], value: unknown) => void
    onStructureChange: (path: string[], value: unknown) => void
    onReferenceChange: (signature: string, value: ReferenceValue | SubFlowValue) => void
}

type InputChange = ReferenceValue | SubFlowValue | LiteralValue | NodeFunction | null
type ListEntry = { uid: number, raw: unknown }
type ObjectEntry = { uid: number, key: string, raw: unknown }

export const DataTypeJSONInputFormComponent: React.FC<DataTypeJSONInputFormComponentProps> = (props) => {

    const {schema, valueSchema, value, activePath, onActivePathChange, onValueChange, onStructureChange, onReferenceChange} = props

    const [items, setItems] = React.useState<ListEntry[]>(() => {
        let raw: unknown = value?.value
        for (const key of activePath) {
            raw = raw && typeof raw === "object" && key in (raw as Record<string, unknown>) ? (raw as Record<string, unknown>)[key] : undefined
        }
        return Array.isArray(raw) ? raw.map((entry, index) => ({uid: index, raw: entry})) : []
    })
    const [entries, setEntries] = React.useState<ObjectEntry[]>(() => {
        let raw: unknown = value?.value
        for (const key of activePath) {
            raw = raw && typeof raw === "object" && key in (raw as Record<string, unknown>) ? (raw as Record<string, unknown>)[key] : undefined
        }
        return raw && typeof raw === "object" && !Array.isArray(raw) ? Object.entries(raw).map(([key, entry], index) => ({uid: index, key, raw: entry})) : []
    })
    const nextUid = React.useRef(Math.max(items.length, entries.length))
    const entrySchemaCache = React.useRef<Record<number, Schema | undefined>>({})

    const addBarStyle: React.CSSProperties = {
        position: "sticky",
        bottom: 0,
        zIndex: 1,
        paddingTop: "0.563rem",
        paddingBottom: "0.563rem",
        background: "#070514"
    }

    const unwrapSchema = (target: Schema | Schema[] | undefined): Schema | undefined =>
        Array.isArray(target) ? target[0] : target

    const isDataSchema = (target: Schema | undefined): boolean =>
        target?.input === "data" || target?.input === "type"

    const schemaAtPath = (root: Schema | undefined, path: string[]): Schema | undefined => {
        let current = root
        for (const key of path) {
            if (!current) return undefined
            if (isDataSchema(current)) {
                current = unwrapSchema((current as DataInput).properties?.[key])
            } else if (current.input?.startsWith("list")) {
                const listItems = (current as ListInput).items
                current = unwrapSchema(listItems?.[Number(key)] ?? listItems?.[(listItems?.length ?? 0) - 1])
            } else {
                return undefined
            }
        }
        return current
    }

    const valueAtPath = (path: string[]): unknown => {
        let current: unknown = value?.value
        for (const key of path) {
            if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
                current = (current as Record<string, unknown>)[key]
            } else {
                return undefined
            }
        }
        return current
    }

    const resolveSchema = (path: string[]): Schema | undefined => schemaAtPath(valueSchema ?? schema, path)

    const describeInput = (target: Schema | undefined): string => {
        switch (target?.input) {
            case "boolean":
                return "A true or false toggle for this value"
            case "number":
                return "A numeric value entered for this field"
            case "text":
                return "A free-form text value for this field"
            case "select":
                return "Pick one option from the available predefined values"
            case "list-select":
                return "Pick several options from the available predefined values"
            case "list-boolean":
                return "A list of true or false toggle values"
            case "list-number":
                return "A list of numeric values for this field"
            case "list-text":
                return "A list of free-form text values here"
            case "date":
                return "A calendar date chosen for this value"
            case "color":
                return "A color picked for this field's value"
            case "file":
                return "A single file selected for this field"
            case "list-file":
                return "A list of files selected for this field"
            case "sub-flow":
                return "A referenced sub-flow run for this field"
            case "list-sub-flow":
                return "A list of referenced sub-flows to run"
            case "data":
            case "type":
                return "A nested object with its own editable properties"
            case "list":
                return "A list of items you can add and edit"
            case "generic":
                return "A flexible value without a fixed input type"
            default:
                return "A value entered for this field's input"
        }
    }

    const referenceSignature = (raw: unknown): string | undefined =>
        typeof raw === "string" ? raw.match(/^\$\{(.+)}$/)?.[1] : undefined

    const signatureFor = (raw: unknown): string => {
        const existing = referenceSignature(raw)
        if (existing) return existing
        const used = new Set((value?.references ?? []).map(reference => reference.signature))
        let index = 0
        while (used.has(`ref_${index}`)) index++
        return `ref_${index}`
    }

    const referenceFor = (raw: unknown): NodeParameterValue | undefined => {
        const signature = referenceSignature(raw)
        if (!signature) return undefined
        return value?.references?.find(reference => reference.signature === signature)?.value ?? undefined
    }

    const toInitialValue = (raw: unknown): LiteralValue | undefined =>
        raw === null || raw === undefined ? undefined : {__typename: "LiteralValue", value: raw}

    const toRawValue = (change: InputChange): unknown =>
        change === null ? null : change.__typename === "LiteralValue" ? change.value : change

    const isReference = (change: InputChange): change is ReferenceValue | SubFlowValue =>
        change !== null && change.__typename !== "LiteralValue" && change.__typename !== "NodeFunction"

    const commitItems = (next: ListEntry[]) => {
        setItems(next)
        onValueChange(activePath, next.map(item => item.raw))
    }

    const commitEntries = (next: ObjectEntry[]) => {
        setEntries(next)
        onValueChange(activePath, Object.assign({}, ...next.map(entry => ({[entry.key]: entry.raw}))))
    }

    const renameEntries = (next: ObjectEntry[]) => {
        setEntries(next)
        onStructureChange(activePath, Object.assign({}, ...next.map(entry => ({[entry.key]: entry.raw}))))
    }

    const changeItem = (item: ListEntry, change: InputChange) => {
        if (isReference(change)) {
            const signature = signatureFor(item.raw)
            item.raw = `\${${signature}}`
            onReferenceChange(signature, change)
        } else {
            item.raw = toRawValue(change)
        }
        onValueChange(activePath, items.map(current => current.raw))
    }

    const selectItem = (item: ListEntry, change: InputChange) => {
        if (isReference(change)) {
            const signature = signatureFor(item.raw)
            onReferenceChange(signature, change)
            commitItems(items.map(current => current.uid === item.uid ? {...current, raw: `\${${signature}}`} : current))
        } else {
            commitItems(items.map(current => current.uid === item.uid ? {...current, raw: toRawValue(change)} : current))
        }
    }

    const changeEntry = (entry: ObjectEntry, change: InputChange) => {
        if (isReference(change)) {
            const signature = signatureFor(entry.raw)
            entry.raw = `\${${signature}}`
            onReferenceChange(signature, change)
        } else {
            entry.raw = toRawValue(change)
        }
        onValueChange(activePath, Object.assign({}, ...entries.map(current => ({[current.key]: current.raw}))))
    }

    const selectEntry = (entry: ObjectEntry, change: InputChange) => {
        if (isReference(change)) {
            const signature = signatureFor(entry.raw)
            onReferenceChange(signature, change)
            commitEntries(entries.map(current => current.uid === entry.uid ? {...current, raw: `\${${signature}}`} : current))
        } else {
            commitEntries(entries.map(current => current.uid === entry.uid ? {...current, raw: toRawValue(change)} : current))
        }
    }

    const changeLevel = (change: InputChange) => {
        if (isReference(change)) {
            const signature = signatureFor(valueAtPath(activePath))
            onReferenceChange(signature, change)
            onValueChange(activePath, `\${${signature}}`)
        } else {
            onValueChange(activePath, toRawValue(change))
        }
    }

    return (
        <div>

            {resolveSchema(activePath)?.input === "list" && (
                <>
                    {items.map((item, index) => {
                        const path = [...activePath, String(index)]
                        return (
                            <DataTypeJSONInputFieldComponent key={item.uid}
                                                             label={`Item ${index + 1}`}
                                                             description={describeInput(resolveSchema(path))}
                                                             schema={resolveSchema(path)}
                                                             reference={referenceFor(item.raw)}
                                                             initialValue={referenceFor(item.raw) ?? toInitialValue(item.raw)}
                                                             onDrillIn={() => onActivePathChange(path)}
                                                             onChange={change => changeItem(item, change)}
                                                             onSelect={change => selectItem(item, change)}
                                                             onRemove={() => commitItems(items.filter(current => current.uid !== item.uid))}/>
                        )
                    })}
                    <div style={addBarStyle}>
                        <Button color={"secondary"} paddingSize={"xxs"} w={"100%"}
                                onClick={() => commitItems([...items, {uid: nextUid.current++, raw: null}])}>
                            <IconPlus size={13}/>
                            <Text size={"sm"}>Add item</Text>
                        </Button>
                    </div>
                </>
            )}

            {isDataSchema(resolveSchema(activePath)) && (
                <>
                    {entries.map((entry, index) => {
                        const path = [...activePath, entry.key]
                        const resolvedSchema = resolveSchema(path)
                        if (resolvedSchema) entrySchemaCache.current[entry.uid] = resolvedSchema
                        const entrySchema = resolvedSchema ?? entrySchemaCache.current[entry.uid]
                        return (
                            <DataTypeJSONInputFieldComponent key={entry.uid}
                                                             label={entry.key}
                                                             description={describeInput(entrySchema)}
                                                             schema={entrySchema}
                                                             reference={referenceFor(entry.raw)}
                                                             initialValue={referenceFor(entry.raw) ?? toInitialValue(entry.raw)}
                                                             editableKey
                                                             onKeyChange={key => renameEntries(entries.map((current, currentIndex) =>
                                                                 currentIndex === index ? {...current, key} : current))}
                                                             onDrillIn={() => onActivePathChange(path)}
                                                             onChange={change => changeEntry(entry, change)}
                                                             onSelect={change => selectEntry(entry, change)}
                                                             onRemove={() => commitEntries(entries.filter(current => current.uid !== entry.uid))}/>
                        )
                    })}
                    <div style={addBarStyle}>
                        <Button color={"secondary"} paddingSize={"xxs"} w={"100%"}
                                onClick={() => commitEntries([...entries, {uid: nextUid.current++, key: `key${entries.length + 1}`, raw: null}])}>
                            <IconPlus size={13}/>
                            <Text size={"sm"}>Add key</Text>
                        </Button>
                    </div>
                </>
            )}

            {resolveSchema(activePath)?.input !== "list" && !isDataSchema(resolveSchema(activePath)) && (
                <DataTypeInputComponent schema={resolveSchema(activePath) as Schema}
                                        title={activePath[activePath.length - 1] ?? ""}
                                        description={describeInput(resolveSchema(activePath))}
                                        clearable
                                        formValidation={{valid: true}}
                                        initialValue={referenceFor(valueAtPath(activePath)) ?? toInitialValue(valueAtPath(activePath))}
                                        onChange={changeLevel}/>
            )}
        </div>
    )
}
