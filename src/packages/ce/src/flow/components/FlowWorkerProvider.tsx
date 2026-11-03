import React from "react"
import {Flow, LiteralValue, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {SignatureSchema} from "@code0-tech/triangulum";
import {useService, useStore} from "@code0-tech/pictor";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FunctionService} from "@edition/function/services/Function.service";
import type {JsonSchema} from "@core/util/json-schema";

interface Deferred {
    resolve: (value: any) => void
    reject: (reason?: any) => void
    timeout: ReturnType<typeof setTimeout>
}

type FlowWorkerActions =
    "validation"
    | "value_suggestions"
    | "reference_suggestions"
    | "node_suggestions"
    | "node_type_extraction"
    | "type_extraction"
    | "value_extraction"
    | "type_variant"
    | "schema"
    | "flow_schemas"
    | "json_schema"
    | "sub_flow_schema"

interface FlowWorkerFlowPayload {
    flow: Flow
}

interface FlowWorkerTypePayload {
    type: string
}

interface FlowWorkerReferenceSuggestionsPayload {
    flow: Flow
    nodeId: NodeFunction['id']
    parameterIndex: number
}

interface FlowWorkerNodeTypeExtractionPayload {
    node: NodeFunction
}

interface FlowWorkerTypeExtractionPayload {
    value: LiteralValue
}

interface FlowWorkerSubFlowSchemaPayload {
    flow: Flow
    nodeId: NodeFunction['id']
    parameterIndex: number
    referenceSignature?: string
}

interface FlowWorkerSchemaPayload {
    flow: Flow
    nodeId?: NodeFunction['id']
}

type FlowWorkerPayload =
    FlowWorkerFlowPayload
    | FlowWorkerTypePayload
    | FlowWorkerReferenceSuggestionsPayload
    | FlowWorkerNodeTypeExtractionPayload
    | FlowWorkerTypeExtractionPayload
    | FlowWorkerSubFlowSchemaPayload
    | FlowWorkerSchemaPayload

interface WorkerContextType {
    calculate: (action: FlowWorkerActions, payload: FlowWorkerPayload) => Promise<any>
    hydrated: boolean
}

const WorkerContext = React.createContext<WorkerContextType | null>(null)

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const requestTimeout = 10_000

    const workerRef = React.useRef<Worker | null>(null)
    const resolvers = React.useRef<Map<string, Deferred>>(new Map())

    const dataTypeService = useService(DatatypeService)
    const dataTypeStore = useStore(DatatypeService)
    const functionService = useService(FunctionService)
    const functionStore = useStore(FunctionService)

    const dataTypes = React.useMemo(() => dataTypeService.values(), [dataTypeService, dataTypeStore])
    const functions = React.useMemo(() => functionService.values(), [functionService, functionStore])
    const hydrated = dataTypes.length > 0 && functions.length > 0

    const hydrationRef = React.useRef<{ dataTypes: unknown[], functions: unknown[] }>({dataTypes, functions})
    const sentHydrationRef = React.useRef<{ dataTypes: unknown[], functions: unknown[] } | null>(null)
    hydrationRef.current = {dataTypes, functions}

    const disposeWorker = React.useCallback((reason?: any) => {
        workerRef.current?.terminate()
        workerRef.current = null
        sentHydrationRef.current = null

        resolvers.current.forEach(deferred => {
            clearTimeout(deferred.timeout)
            deferred.reject(reason)
        })
        resolvers.current.clear()
    }, [])

    // Lazily (re)create the worker. Runs client-side only. This must not depend on
    // effect ordering: child components may trigger worker actions in their own mount
    // effects, which fire before this provider's effect (React runs effects child-first).
    const ensureWorker = React.useCallback((): Worker | null => {
        if (typeof Worker === "undefined") return null
        if (workerRef.current) return workerRef.current

        const worker = new Worker(new URL('./Flow.worker.js', import.meta.url))
        worker.onmessage = (e) => {
            const {id, data, error} = e.data
            const deferred = resolvers.current.get(id)

            if (deferred) {
                clearTimeout(deferred.timeout)

                if (error) {
                    deferred.reject(error)
                } else {
                    deferred.resolve(data)
                }
                resolvers.current.delete(id)
            }
        }

        workerRef.current = worker
        return worker
    }, [])

    React.useEffect(() => {
        ensureWorker()
        return () => disposeWorker("Worker was disposed")
    }, [ensureWorker, disposeWorker])

    const calculate = React.useCallback((action: FlowWorkerActions, payload: FlowWorkerPayload) => {
        return new Promise((resolve, reject) => {
            const worker = ensureWorker()
            if (!worker) {
                return reject("Worker ist nicht initialisiert");
            }

            const hydration = hydrationRef.current
            if (sentHydrationRef.current?.dataTypes !== hydration.dataTypes
                || sentHydrationRef.current?.functions !== hydration.functions) {
                worker.postMessage({action: "hydrate", payload: hydration})
                sentHydrationRef.current = hydration
            }

            const id = Math.random().toString(36).substring(2, 9);
            const timeout = setTimeout(
                () => disposeWorker(`Worker action ${action} exceeded ${requestTimeout}ms and was terminated`),
                requestTimeout
            )

            resolvers.current.set(id, {resolve, reject, timeout});
            worker.postMessage({id, action, payload});
        });
    }, [ensureWorker, disposeWorker]);

    const context = React.useMemo(() => ({calculate, hydrated}), [calculate, hydrated])

    return (
        <WorkerContext.Provider value={context}>
            {children}
        </WorkerContext.Provider>
    )
}

const useFlowWorker = () => {
    const context = React.useContext(WorkerContext)
    if (!context) throw new Error("useWorker must be used within WorkerProvider")
    return context
}

// Ein generischer Hook, der die Basis-Logik kapselt
function useWorkerAction<TResult, TPayload>(action: FlowWorkerActions) {
    const {calculate, hydrated} = useFlowWorker();
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<any>(null);

    const execute = React.useCallback(async (payload: TPayload): Promise<TResult | undefined> => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await calculate(action, payload as any);
            return result as TResult;
        } catch (err) {
            setError(err);
            console.error(`Worker Action ${action} failed:`, err);
        } finally {
            setIsLoading(false);
        }
    }, [calculate, action]);

    return {execute, isLoading, error, hydrated};
}

// --- Spezifische Hooks ---

export const useFlowValidationAction = () =>
    useWorkerAction<any[], FlowWorkerFlowPayload>("validation");

export const useValueSuggestionsAction = () =>
    useWorkerAction<any[], FlowWorkerTypePayload>("value_suggestions");

export const useReferenceSuggestionsAction = () =>
    useWorkerAction<any[], FlowWorkerReferenceSuggestionsPayload>("reference_suggestions");

export const useNodeSuggestionsAction = () =>
    useWorkerAction<any[], FlowWorkerTypePayload>("node_suggestions");

export const useNodeTypeExtractionAction = () =>
    useWorkerAction<any[], FlowWorkerNodeTypeExtractionPayload>("node_type_extraction");

export const useTypeExtractionAction = () =>
    useWorkerAction<string, FlowWorkerTypeExtractionPayload>("type_extraction");

export const useValueExtractionAction = () =>
    useWorkerAction<LiteralValue, FlowWorkerTypePayload>("value_extraction");

export const useJsonSchemaAction = () =>
    useWorkerAction<JsonSchema, FlowWorkerTypePayload>("json_schema");

export const useSchemaAction = () =>
    useWorkerAction<SignatureSchema, FlowWorkerSchemaPayload>("schema");

export const useFlowSchemasAction = () =>
    useWorkerAction<SignatureSchema[], FlowWorkerFlowPayload>("flow_schemas");

export const useSubFlowSchemaAction = () =>
    useWorkerAction<SignatureSchema | undefined, FlowWorkerSubFlowSchemaPayload>("sub_flow_schema");
