import {
    DFlowFunctionDependencies,
    DFlowFunctionReactiveService,
    FunctionDefinitionView,
    ReactiveArrayStore
} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";
import {Flow, FunctionDefinition, Query} from "@code0-tech/sagittarius-graphql-types";
import functionsQuery from "@edition/function/queries/Functions.query.graphql";

export class FunctionService extends DFlowFunctionReactiveService {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<FunctionDefinitionView>) {
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

                    first1: 50,
                    after1: null,
                    first2: 50,
                    after2: null,
                    first3: 50,
                    after3: null,
                    first4: 50,
                    after4: null,
                    first5: 50,
                    after5: null,
                    first6: 50,
                    after6: null,
                    first7: 50,
                    after7: null,
                    first8: 50,
                    after8: null,
                    first9: 50,
                    after9: null,
                    first10: 50,
                    after10: null,
                }
            }).then(res => {
                const nodes = res.data?.namespace?.project?.primaryRuntime?.functionDefinitions?.nodes ?? []
                nodes.forEach(functionD => {
                    if (functionD && !this.hasById(functionD.id)) {
                        this.set(this.i++, new FunctionDefinitionView(functionD))
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