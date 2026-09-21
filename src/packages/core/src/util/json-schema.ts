import ts from "typescript"
import {createSystem, createVirtualTypeScriptEnvironment, VirtualTypeScriptEnvironment} from "@typescript/vfs"
import {DataType} from "@code0-tech/sagittarius-graphql-types"
import {createParser} from "ts-json-schema-generator/dist/factory/parser.js"
import {createFormatter} from "ts-json-schema-generator/dist/factory/formatter.js"
import {SchemaGenerator} from "ts-json-schema-generator/dist/src/SchemaGenerator.js"
import {DEFAULT_CONFIG} from "ts-json-schema-generator/dist/src/Config.js"

export type JsonSchema = Record<string, any>

const ENTRY_FILE = "index.ts"
const LIB_FILE = "lib.codezero.d.ts"
const ROOT_TYPE = "Code0Type"

// The datatype declarations are plain type aliases, so the environment only needs the
// handful of globals TypeScript itself resolves against - never the full DOM/ESNext libs.
const LIB = `
interface Array<T> { [n: number]: T; length: number }
interface String { readonly length: number }
interface Number {}
interface Boolean {}
interface Object {}
interface Function {}
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface IArguments {}
interface RegExp {}
`

const COMPILER_OPTIONS: ts.CompilerOptions = {
    target: ts.ScriptTarget.Latest,
    lib: [LIB_FILE],
    noEmit: true,
    strictNullChecks: true
}

const CONFIG = {...DEFAULT_CONFIG, expose: "none" as const, topRef: false, jsDoc: "none" as const, skipTypeCheck: true}

const buildDeclarations = (dataTypes: DataType[]): string => dataTypes
    .filter(dataType => dataType.identifier && dataType.type)
    .map(dataType => {
        const generics = (dataType.genericKeys ?? []).filter(key => !!key)
        const parameters = generics.length > 0 ? `<${generics.join(", ")}>` : ""
        return `type ${dataType.identifier}${parameters} = ${dataType.type};`
    })
    .join("\n")

let environment: VirtualTypeScriptEnvironment | undefined
let environmentDeclarations: string | undefined

const getEnvironment = (declarations: string, source: string): VirtualTypeScriptEnvironment => {
    if (environment && environmentDeclarations === declarations) {
        environment.updateFile(ENTRY_FILE, source)
        return environment
    }
    const files = new Map([[ENTRY_FILE, source], [LIB_FILE, LIB]])
    environment = createVirtualTypeScriptEnvironment(createSystem(files), [ENTRY_FILE, LIB_FILE], ts, COMPILER_OPTIONS)
    environmentDeclarations = declarations
    return environment
}

export const getJsonSchemaFromType = (type?: string | null, dataTypes: DataType[] = []): JsonSchema => {
    const expression = (type ?? "").trim()
    if (!expression) return {}

    const declarations = buildDeclarations(dataTypes)
    const program = getEnvironment(declarations, `${declarations}\nexport type ${ROOT_TYPE} = ${expression};\n`)
        .languageService.getProgram()
    if (!program) return {}

    try {
        const generator = new SchemaGenerator(program, createParser(program, CONFIG), createFormatter(CONFIG), CONFIG)
        const {$schema, definitions, ...schema} = generator.createSchema(ROOT_TYPE)
        return definitions && Object.keys(definitions).length > 0 ? {...schema, definitions} : schema
    } catch {
        return {}
    }
}
