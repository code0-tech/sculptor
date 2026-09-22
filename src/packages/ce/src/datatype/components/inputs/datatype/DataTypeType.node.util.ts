export type TypeNodeKind = "datatype" | "object" | "union" | "intersection" | "literal"

export interface DataTypeOption {
    identifier: string
    generics: number
    label: string
    displayMessage?: string
    genericKeys: string[]
    moduleId?: string
    moduleName?: string
    moduleIcon?: string
}

export interface TypeField {
    key: string
    node: TypeNode
    optional?: boolean
}

export interface TypeNode {
    id: number
    kind: TypeNodeKind
    identifier?: string
    fields?: TypeField[]
    members?: TypeNode[]
    args?: TypeNode[]
}

let counter = 1

export const createTypeNode = (kind: TypeNodeKind = "datatype", identifier?: string): TypeNode => {
    const base: TypeNode = {id: counter++, kind}
    if (kind === "datatype") base.identifier = identifier ?? ""
    if (kind === "literal") base.identifier = identifier ?? ""
    if (kind === "object") base.fields = []
    if (kind === "union" || kind === "intersection") base.members = [createTypeNode("datatype"), createTypeNode("datatype")]
    return base
}

export const childrenOf = (node: TypeNode): { label: string, node: TypeNode }[] => {
    switch (node.kind) {
        case "object":
            return (node.fields ?? []).map(field => ({label: field.key, node: field.node}))
        case "union":
        case "intersection":
            return (node.members ?? []).map((member, index) => ({label: `option ${index + 1}`, node: member}))
        case "datatype":
            return (node.args ?? []).map((arg, index) => ({label: `generic ${index + 1}`, node: arg}))
        default:
            return []
    }
}

export const isContainerKind = (kind: TypeNodeKind): boolean =>
    kind === "object" || kind === "union" || kind === "intersection"

export const getNodeAtPath = (root: TypeNode, path: number[]): TypeNode | undefined => {
    let current: TypeNode | undefined = root
    for (const id of path) {
        if (!current) return undefined
        current = childrenOf(current).find(child => child.node.id === id)?.node
    }
    return current
}

export const replaceNode = (root: TypeNode, id: number, updater: (node: TypeNode) => TypeNode): TypeNode => {
    if (root.id === id) return updater(root)
    if (root.fields) return {...root, fields: root.fields.map(field => ({...field, node: replaceNode(field.node, id, updater)}))}
    if (root.members) return {...root, members: root.members.map(member => replaceNode(member, id, updater))}
    if (root.args) return {...root, args: root.args.map(arg => replaceNode(arg, id, updater))}
    return root
}

const matchingClose = (str: string, openIdx: number): number => {
    const open = str[openIdx]
    const close = {"{": "}", "(": ")", "<": ">", "[": "]"}[open]
    let depth = 0
    let inString: string | null = null
    for (let i = openIdx; i < str.length; i++) {
        const character = str[i]
        if (inString) {
            if (character === inString) inString = null
            continue
        }
        if (character === '"' || character === "'") inString = character
        else if (character === open) depth++
        else if (character === close) {
            depth--
            if (depth === 0) return i
        }
    }
    return -1
}

const splitTopLevel = (str: string, separator: string): string[] => {
    const parts: string[] = []
    let depth = 0
    let last = 0
    let inString: string | null = null
    for (let i = 0; i < str.length; i++) {
        const character = str[i]
        if (inString) {
            if (character === inString) inString = null
            continue
        }
        if (character === '"' || character === "'") inString = character
        else if (character === "{" || character === "(" || character === "<" || character === "[") depth++
        else if (character === "}" || character === ")" || character === ">" || character === "]") depth--
        else if (depth === 0 && character === separator) {
            parts.push(str.slice(last, i))
            last = i + 1
        }
    }
    parts.push(str.slice(last))
    return parts.map(part => part.trim()).filter(part => part.length > 0)
}

const parsePrimary = (input: string): TypeNode => {
    let str = input.trim()
    let stripped = false
    while (str.startsWith("(") && matchingClose(str, 0) === str.length - 1) {
        str = str.slice(1, -1).trim()
        stripped = true
    }
    if (stripped) return parseTypeToNode(str)

    if (str.endsWith("[]")) {
        const list = createTypeNode("datatype", "LIST")
        list.args = [parseTypeToNode(str.slice(0, -2))]
        return list
    }
    if (str.startsWith("{") && matchingClose(str, 0) === str.length - 1) {
        const object = createTypeNode("object")
        object.fields = splitTopLevel(str.slice(1, -1), ";").flatMap(member => splitTopLevel(member, ",")).flatMap(member => {
            const colon = member.indexOf(":")
            if (colon === -1) return []
            const rawKey = member.slice(0, colon).trim()
            const optional = rawKey.endsWith("?")
            const key = rawKey.replace(/\?$/, "").replace(/^["']|["']$/g, "")
            return [{key, optional, node: parseTypeToNode(member.slice(colon + 1))}]
        })
        return object
    }
    if (/^(["'].*["']|-?\d+(\.\d+)?|true|false)$/.test(str)) {
        return createTypeNode("literal", str.replace(/^["']|["']$/g, ""))
    }
    const generic = str.match(/^([A-Za-z_$][\w$]*)\s*<(.+)>$/)
    if (generic) {
        const name = generic[1]
        const args = splitTopLevel(generic[2], ",")
        const identifier = name === "Array" || name === "ReadonlyArray" ? "LIST" : name
        const datatype = createTypeNode("datatype", identifier)
        datatype.args = args.map(parseTypeToNode)
        return datatype
    }
    return createTypeNode("datatype", str)
}

export const parseTypeToNode = (input?: string | null): TypeNode => {
    const str = (input ?? "").trim()
    if (!str) return createTypeNode("datatype")

    const unions = splitTopLevel(str, "|")
    if (unions.length > 1) {
        const union = createTypeNode("union")
        union.members = unions.map(parseTypeToNode)
        return union
    }
    const intersections = splitTopLevel(str, "&")
    if (intersections.length > 1) {
        const intersection = createTypeNode("intersection")
        intersection.members = intersections.map(parseTypeToNode)
        return intersection
    }
    return parsePrimary(str)
}

export const inferTypeFromValue = (value: unknown): TypeNode => {
    if (typeof value === "string") return createTypeNode("datatype", "TEXT")
    if (typeof value === "number") return createTypeNode("datatype", "NUMBER")
    if (typeof value === "boolean") return createTypeNode("datatype", "BOOLEAN")
    if (Array.isArray(value)) {
        const list = createTypeNode("datatype", "LIST")
        list.args = [value.length > 0 ? inferTypeFromValue(value[0]) : createTypeNode("datatype")]
        return list
    }
    if (value !== null && typeof value === "object") {
        const object = createTypeNode("object")
        object.fields = Object.entries(value as Record<string, unknown>)
            .map(entry => ({key: entry[0], node: inferTypeFromValue(entry[1])}))
        return object
    }
    return createTypeNode("datatype")
}

export const serializeType = (node: TypeNode | undefined): string => {
    if (!node) return ""
    switch (node.kind) {
        case "datatype": {
            if (!node.identifier) return ""
            const args = (node.args ?? []).map(serializeType).filter(part => part.length > 0)
            return args.length > 0 ? `${node.identifier}<${args.join(", ")}>` : node.identifier
        }
        case "literal": {
            const raw = (node.identifier ?? "").trim()
            if (!raw) return ""
            if (/^(-?\d+(\.\d+)?|true|false)$/.test(raw) || /^["'].*["']$/.test(raw)) return raw
            return `"${raw}"`
        }
        case "object": {
            const fields = (node.fields ?? [])
                .filter(field => field.key)
                .map(field => `${field.key}${field.optional ? "?" : ""}: ${serializeType(field.node) || "any"}`)
            return fields.length > 0 ? `{ ${fields.join(", ")} }` : "{}"
        }
        case "union":
        case "intersection": {
            const separator = node.kind === "union" ? " | " : " & "
            const parts = (node.members ?? [])
                .map(serializeType)
                .filter(part => part.length > 0)
                .map(part => part.includes(" | ") || part.includes(" & ") ? `(${part})` : part)
            return parts.join(separator)
        }
        default:
            return ""
    }
}

export interface TypeError {
    path: number[]
    fieldId?: number
    nodeId?: number
    message: string
}

export const collectTypeErrors = (root: TypeNode): TypeError[] => {
    const errors: TypeError[] = []
    const validateFill = (node: TypeNode, containerPath: number[]) => {
        if (node.kind === "datatype" && !(node.identifier ?? "").trim())
            errors.push({path: containerPath, nodeId: node.id, message: "Please choose what each part is."})
    }
    const walk = (node: TypeNode, path: number[]) => {
        if (node.kind === "literal" && !(node.identifier ?? "").trim())
            errors.push({path, nodeId: node.id, message: "Please fill in every exact value."})
        if (node.kind === "object") {
            const seen = new Map<string, number>()
            for (const field of node.fields ?? []) {
                const key = field.key.trim()
                if (!key) errors.push({path, fieldId: field.node.id, message: "Please give every piece of information a name."})
                else if (seen.has(key)) errors.push({path, fieldId: field.node.id, message: `The name "${key}" is used more than once.`})
                else seen.set(key, field.node.id)
                validateFill(field.node, path)
            }
        }
        if (node.kind === "union" || node.kind === "intersection")
            for (const member of node.members ?? []) validateFill(member, path)
        if (node.kind === "datatype")
            for (const arg of node.args ?? []) validateFill(arg, path)
        for (const child of childrenOf(node)) walk(child.node, [...path, child.node.id])
    }
    walk(root, [])
    return errors
}

export const hasStructure = (node: TypeNode): boolean =>
    node.kind === "object"
        ? true
        : node.kind === "union" || node.kind === "intersection"
            ? (node.members ?? []).some(hasStructure)
            : (node.args ?? []).some(hasStructure)

export const describeType = (node: TypeNode, options: DataTypeOption[]): string => {
    if (node.kind === "object") {
        const count = (node.fields ?? []).length
        return count === 0 ? "empty form" : `form with ${count} ${count === 1 ? "field" : "fields"}`
    }
    if (node.kind === "union" || node.kind === "intersection") {
        const parts = (node.members ?? []).map(member => describeType(member, options)).filter(part => part.length > 0)
        if (parts.length === 0) return node.kind === "union" ? "one of a few choices" : "a combination"
        return parts.join(node.kind === "union" ? " or " : " and ")
    }
    if (node.kind === "literal") return (node.identifier ?? "").trim() ? `exactly “${node.identifier}”` : "an exact value"
    if (!(node.identifier ?? "").trim()) return "not chosen yet"

    const option = options.find(candidate => candidate.identifier === node.identifier)
    const label = option?.label ?? node.identifier!
    const args = (node.args ?? []).map(arg => describeType(arg, options))

    if (option?.displayMessage) {
        let unresolved = false
        const filled = option.displayMessage.replace(/\$\{([^}]+)}/g, (_, variable: string) => {
            const index = option.genericKeys.findIndex(key => key.split(/\s+extends\s+/)[0].trim() === variable.trim())
            if (index < 0) {
                unresolved = true
                return ""
            }
            return args[index] ?? "…"
        })
        if (!unresolved) {
            const message = filled.replace(/^(a|an|the)\s+/i, "").trim()
            return message.charAt(0).toUpperCase() + message.slice(1)
        }
    }
    return args.length > 0 ? `${label} of ${args.join(" and ")}` : label
}
