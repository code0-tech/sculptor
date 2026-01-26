import {
    DFlowFunctionDependencies,
    DFlowFunctionReactiveService,
    FunctionDefinitionView,
    ReactiveArrayStore
} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";
import {FunctionDefinition, Query} from "@code0-tech/sagittarius-graphql-types";
import functionsQuery from "@edition/function/queries/Functions.query.graphql";
import {View} from "@code0-tech/pictor/dist/utils/view";

export class FunctionService extends DFlowFunctionReactiveService {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<FunctionDefinitionView>>) {
        super(store)
        this.client = client
    }

    values(dependencies?: DFlowFunctionDependencies): FunctionDefinitionView[] {
        const functions = super.values()
        if (!dependencies?.namespaceId || !dependencies.projectId || !dependencies.runtimeId) return functions

        const namespaceId = dependencies.namespaceId
        const projectId = dependencies.projectId
        const runtimeId = dependencies.runtimeId
        const filtered = functions.filter(functionD => functionD.runtimeFunctionDefinition?.runtime?.id === runtimeId)

        if (filtered.length <= 0) {
            this.client.query<Query>({
                query: functionsQuery,
                variables: {
                    namespaceId: namespaceId,
                    projectId: projectId,

                    firstFunction: 50,
                    afterFunction: null,

                    firstDataTypeIdentifier: 50,
                    afterDataTypeIdentifier: null,

                    firstParameterDefinition: 50,
                    afterParameterDefinition: null,
                }
            }).then(res => {
                const nodes = res.data?.namespace?.project?.primaryRuntime?.functionDefinitions?.nodes ?? []
                nodes.forEach(functionD => {
                    if (functionD && !this.hasById(functionD.id)) {
                        this.set(this.i++, new View(new FunctionDefinitionView(functionD)))
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: FunctionDefinition["id"]): boolean {
        const functionD = super.values().find(f => f.id === id)
        return functionD !== undefined
    }

}