import {
    DFlowTypeDependencies,
    DFlowTypeReactiveService,
    FlowTypeView, FunctionDefinitionView,
    ReactiveArrayStore
} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";
import {FlowType, FunctionDefinition, Query} from "@code0-tech/sagittarius-graphql-types";
import flowTypesQuery from "@edition/flowtype/queries/FlowTypes.query.graphql"

export class FlowtypeService extends DFlowTypeReactiveService {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<FlowTypeView>) {
        super(store)
        this.client = client
    }

    values(dependencies?: DFlowTypeDependencies): FlowTypeView[] {
        const functions = super.values()
        if (!dependencies?.namespaceId || !dependencies.projectId || !dependencies.runtimeId) return functions

        const namespaceId = dependencies.namespaceId
        const projectId = dependencies.projectId
        const runtimeId = dependencies.runtimeId
        const filtered = functions.filter(flowType => flowType) //TODO: add runtime filter when available

        if (filtered.length <= 0) {
            this.client.query<Query>({
                query: flowTypesQuery,
                variables: {
                    namespaceId: namespaceId,
                    projectId: projectId,

                    firstFlowType: 50,
                    afterFlowType: null,
                }
            }).then(res => {
                const nodes = res.data?.namespace?.project?.primaryRuntime?.flowTypes?.nodes ?? []
                nodes.forEach(flowType => {
                    if (flowType && !this.hasById(flowType.id)) {
                        this.set(this.i++, new FlowTypeView(flowType))
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: FlowType["id"]): boolean {
        const flowType = super.values().find(f => f.id === id)
        return flowType !== undefined
    }

}