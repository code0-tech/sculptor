import {DFlowDependencies, DFlowReactiveService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Flow,
    Mutation,
    NamespacesProjectsFlowsCreateInput,
    NamespacesProjectsFlowsCreatePayload,
    NamespacesProjectsFlowsDeleteInput,
    NamespacesProjectsFlowsDeletePayload,
    NamespacesProjectsFlowsUpdateInput,
    NamespacesProjectsFlowsUpdatePayload,
    NodeFunction,
    Query
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import flowsQuery from "@edition/flow/queries/Flows.query.graphql";
import flowCreateMutation from "@edition/flow/mutations/Flow.create.mutation.graphql";
import flowDeleteMutation from "@edition/flow/mutations/Flow.delete.mutation.graphql";
import flowUpdateMutation from "@edition/flow/mutations/Flow.update.mutation.graphql";


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

                    firstSetting: 50,
                    afterSetting: null,

                    // firstInputDataTypeIdentifier: 50,
                    // afterInputDataTypeIdentifier: null,
                    // firstInputRule: 50,
                    // afterInputRule: null,
                    //
                    // firstReturnDataTypeIdentifier: 50,
                    // afterReturnDataTypeIdentifier: null,
                    // firstReturnRule: 50,
                    // afterReturnRule: null
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


    async addNextNodeById(flowId: Flow["id"], parentNodeId: NodeFunction["id"] | null, nextNode: NodeFunction): Promise<void> {

        await super.addNextNodeById(flowId, parentNodeId, nextNode)

        const flow = this.values().find(f => f.id === flowId)
        const flowInput = this.getPayloadById(flowId)

        if (!flow || !flowInput || !flowId) return Promise.reject()

        await this.flowUpdate({
            flowId: flowId,
            flowInput: flowInput
        })
    }

    async flowCreate(payload: NamespacesProjectsFlowsCreateInput): Promise<NamespacesProjectsFlowsCreatePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesProjectsFlowsCreateInput>({
            mutation: flowCreateMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsFlowsCreate && result.data.namespacesProjectsFlowsCreate.flow) {
            const flow = result.data.namespacesProjectsFlowsCreate.flow
            if (!this.hasById(flow.id)) {
                flow.nodes = {nodes: []} //TODO: to avoid issues, when fixed in pictor
                this.add(flow)
            }
        }

        return result.data?.namespacesProjectsFlowsCreate ?? undefined
    }

    async flowDelete(payload: NamespacesProjectsFlowsDeleteInput): Promise<NamespacesProjectsFlowsDeletePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesProjectsFlowsDeleteInput>({
            mutation: flowDeleteMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsFlowsDelete && result.data.namespacesProjectsFlowsDelete.flow) {
            const flow = result.data.namespacesProjectsFlowsDelete.flow
            const index = this.values().findIndex(f => f.id === flow.id)
            this.delete(index)

        }

        return result.data?.namespacesProjectsFlowsDelete ?? undefined
    }

    async flowUpdate(payload: NamespacesProjectsFlowsUpdateInput): Promise<NamespacesProjectsFlowsUpdatePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesProjectsFlowsUpdateInput>({
            mutation: flowUpdateMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsFlowsUpdate && result.data.namespacesProjectsFlowsUpdate.flow) {
            const flow = result.data.namespacesProjectsFlowsUpdate.flow
            const index = this.values().findIndex(f => f.id === flow.id)
            this.set(index, {...this.get(index), ...flow})

        }

        return result.data?.namespacesProjectsFlowsUpdate ?? undefined
    }

}