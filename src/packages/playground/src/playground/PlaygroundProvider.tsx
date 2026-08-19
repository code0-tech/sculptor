"use client"

import React from "react";
import '@xyflow/react/dist/style.css';
import {ApolloClient} from "@apollo/client";
import {ContextStoreProvider} from "@code0-tech/pictor";
import {Payload, View} from "@code0-tech/pictor/dist/utils/view";
import {ResizablePanelGroup} from "@code0-tech/pictor/dist/components/resizable/Resizable";
import {FullScreen} from "@code0-tech/pictor/dist/components/fullscreen/FullScreen";
import {ReactFlowProvider} from "@xyflow/react";
import {
    DataType,
    Flow,
    FlowType,
    FunctionDefinition,
    NamespaceProject,
    RuntimeModule
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import {usePersistentReactiveArrayService} from "@/hooks/usePersistentReactiveArrayService";
import {WorkerProvider} from "@edition/flow/components/FlowWorkerProvider";
import {FlowService} from "@edition/flow/services/Flow.service";
import {FunctionService} from "@edition/function/services/Function.service";
import {DatatypeService} from "@edition/datatype/services/Datatype.service";
import {FlowTypeService} from "@edition/flowtype/services/FlowType.service";
import {ProjectService} from "@edition/project/services/Project.service";
import {ModuleService} from "@edition/module/services/Module.service";
import {AIService, Model} from "@edition/ai/services/AI.service";

export interface PlaygroundMockData {
    flows: Flow[]
    functions: FunctionDefinition[]
    datatypes: DataType[]
    flowtypes: FlowType[]
    projects: NamespaceProject[]
}

export const PlaygroundProvider: React.FC<{ data: PlaygroundMockData, children: React.ReactNode }> = ({data, children}) => {

    const seed = React.useCallback(<T extends Payload>(payloads: T[]) => payloads.map(payload => new View(payload)), [])

    const graphqlClient = React.useMemo(() => {
        const offlineClient = {
            query: async () => ({data: {}}),
            mutate: async () => ({data: {}}),
        } as unknown as ApolloClient
        return new GraphqlClient(offlineClient)
    }, [])

    const flow = usePersistentReactiveArrayService<Flow, FlowService>(
        "playground::flows",
        (store) => new FlowService(graphqlClient, store),
        seed(data.flows)
    )
    const functions = usePersistentReactiveArrayService<FunctionDefinition, FunctionService>(
        "playground::functions",
        (store) => new FunctionService(graphqlClient, store),
        seed(data.functions)
    )
    const datatype = usePersistentReactiveArrayService<DataType, DatatypeService>(
        "playground::datatypes",
        (store) => new DatatypeService(graphqlClient, store),
        seed(data.datatypes)
    )
    const flowtype = usePersistentReactiveArrayService<FlowType, FlowTypeService>(
        "playground::flowtypes",
        (store) => new FlowTypeService(graphqlClient, store),
        seed(data.flowtypes)
    )
    const project = usePersistentReactiveArrayService<NamespaceProject, ProjectService>(
        "playground::projects",
        (store) => new ProjectService(graphqlClient, store),
        seed(data.projects)
    )
    const module = usePersistentReactiveArrayService<RuntimeModule, ModuleService>(
        "playground::modules",
        (store) => new ModuleService(graphqlClient, store),
        seed([] as RuntimeModule[])
    )
    const ai = usePersistentReactiveArrayService<Model, AIService>(
        "playground::ai",
        (store) => new AIService(graphqlClient, store),
        seed([] as Model[])
    )

    return <ContextStoreProvider services={[flow, functions, datatype, flowtype, project, module, ai]}>
        <FullScreen bg={"var(--secondary)"}>
            <WorkerProvider>
                <ReactFlowProvider>
                    <ResizablePanelGroup orientation={"horizontal"}>
                        {children}
                    </ResizablePanelGroup>
                </ReactFlowProvider>
            </WorkerProvider>
        </FullScreen>
    </ContextStoreProvider>
}
