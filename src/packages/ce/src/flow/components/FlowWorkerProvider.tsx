import React from "react"
import {DataType, Flow, FunctionDefinition, LiteralValue, NodeFunction} from "@code0-tech/sagittarius-graphql-types";
import {TypeVariantResult} from "@code0-tech/triangulum/dist/extraction/getTypeVariant";

interface Deferred {
    resolve: (value: any) => void
    reject: (reason?: any) => void
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

interface FlowWorkerValidationPayload {
    flow: Flow
    functions: FunctionDefinition[]
    dataTypes: DataType[]
}

interface FlowWorkerValueSuggestionsPayload {
    type: string
    dataTypes: DataType[]
}

interface FlowWorkerReferenceSuggestionsPayload {
    flow: Flow
    nodeId: NodeFunction['id']
    parameterIndex: number
    functions: FunctionDefinition[]
    dataTypes: DataType[]
}

interface FlowWorkerNodeSuggestionsPayload {
    type: string
    functions: FunctionDefinition[]
    dataTypes: DataType[]
}

interface FlowWorkerNodeTypeExtractionPayload {
    node: NodeFunction
    functions: FunctionDefinition[]
    dataTypes: DataType[]
}

interface FlowWorkerValueExtractionPayload {
    type: string
    dataTypes: DataType[]
}

interface FlowWorkerTypeVariantPayload {
    type: string
    dataTypes: DataType[]
}

interface FlowWorkerTypeExtractionPayload {
    value: LiteralValue
    dataTypes: DataType[]
}

type FlowWorkerPayload =
    FlowWorkerValidationPayload
    | FlowWorkerValueSuggestionsPayload
    | FlowWorkerReferenceSuggestionsPayload
    | FlowWorkerNodeSuggestionsPayload
    | FlowWorkerNodeTypeExtractionPayload
    | FlowWorkerValueExtractionPayload
    | FlowWorkerTypeVariantPayload

interface WorkerContextType {
    calculate: (action: FlowWorkerActions, payload: FlowWorkerPayload) => Promise<any>
}

const WorkerContext = React.createContext<WorkerContextType | null>(null)

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const workerRef = React.useRef<Worker | null>(null)
    const resolvers = React.useRef<Map<string, Deferred>>(new Map())

    React.useEffect(() => {
        workerRef.current = new Worker(new URL('./Flow.worker.js', import.meta.url))

        workerRef.current.onmessage = (e) => {
            const {id, data, error} = e.data
            const deferred = resolvers.current.get(id)

            if (deferred) {
                if (error) {
                    deferred.reject(error)
                } else {
                    deferred.resolve(data)
                }
                resolvers.current.delete(id)
            }
        }

        return () => workerRef.current?.terminate()
    }, [])

    const calculate = React.useCallback((action: FlowWorkerActions, payload: FlowWorkerPayload) => {
        return new Promise((resolve, reject) => {
            if (!workerRef.current) {
                return reject("Worker ist nicht initialisiert");
            }

            const id = Math.random().toString(36).substring(2, 9);
            resolvers.current.set(id, {resolve, reject});
            workerRef.current.postMessage({id, action, payload});
        });
    }, []);

    return (
        <WorkerContext.Provider value={{calculate}}>
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
    const {calculate} = useFlowWorker();
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

    return {execute, isLoading, error};
}

// --- Spezifische Hooks ---

export const useFlowValidationAction = () =>
    useWorkerAction<any[], FlowWorkerValidationPayload>("validation");

export const useValueSuggestionsAction = () =>
    useWorkerAction<any[], FlowWorkerValueSuggestionsPayload>("value_suggestions");

export const useReferenceSuggestionsAction = () =>
    useWorkerAction<any[], FlowWorkerReferenceSuggestionsPayload>("reference_suggestions");

export const useNodeSuggestionsAction = () =>
    useWorkerAction<any[], FlowWorkerNodeSuggestionsPayload>("node_suggestions");

export const useNodeTypeExtractionAction = () =>
    useWorkerAction<any[], FlowWorkerNodeTypeExtractionPayload>("node_type_extraction");

export const useTypeExtractionAction = () =>
    useWorkerAction<string, FlowWorkerTypeExtractionPayload>("type_extraction");

export const useValueExtractionAction = () =>
    useWorkerAction<any[], FlowWorkerValueExtractionPayload>("value_extraction");

export const useTypeVariantAction = () =>
    useWorkerAction<TypeVariantResult[], FlowWorkerValueExtractionPayload>("type_variant");