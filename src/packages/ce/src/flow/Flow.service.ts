import {DFlowDependencies, DFlowReactiveService, DNamespaceMemberView, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Flow, NamespaceMember,
    NamespacesProjectsFlowsCreateInput,
    NamespacesProjectsFlowsCreatePayload,
    NamespacesProjectsFlowsDeleteInput,
    NamespacesProjectsFlowsDeletePayload,
    NamespacesProjectsFlowsUpdateInput,
    NamespacesProjectsFlowsUpdatePayload, Query
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import flowsQuery from "@edition/flow/queries/Flows.query.graphql";

export class FlowService extends DFlowReactiveService {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<Flow>) {
        super(store)
        this.client = client
    }

    values(dependencies?: DFlowDependencies): Flow[] {
        const flows = super.values()
        if (!dependencies?.namespaceId || !dependencies.projectId) return flows

        const namespaceId = dependencies.namespaceId
        const projectId = dependencies.projectId
        const filtered = flows.filter(flow => flow)

        if (filtered.length <= 0) {
            this.client.query<Query>({
                query: flowsQuery,
                variables: {
                    namespaceId: namespaceId,
                    projectId: projectId,

                    firstFlow: 50,
                    afterFlow: null,

                    firstNode: 50,
                    afterNode: null,

                    firstNodeParameter: 50,
                    afterNodeParameter: null,
                }
            }).then(res => {
                const nodes = res.data?.namespace?.project?.flows?.nodes ?? []
                nodes.forEach(flow => {
                    if (flow && !this.hasById(flow.id)) {
                        this.set(this.i++, flow)
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: Flow["id"]): boolean {
        const flow = super.values().find(f => f.id === id)
        return flow !== undefined
    }

    flowCreate(payload: NamespacesProjectsFlowsCreateInput): Promise<NamespacesProjectsFlowsCreatePayload | undefined> {
        return Promise.resolve(undefined);
    }

    flowDelete(payload: NamespacesProjectsFlowsDeleteInput): Promise<NamespacesProjectsFlowsDeletePayload | undefined> {
        return Promise.resolve(undefined);
    }

    flowUpdate(payload: NamespacesProjectsFlowsUpdateInput): Promise<NamespacesProjectsFlowsUpdatePayload | undefined> {
        return Promise.resolve(undefined);
    }

}