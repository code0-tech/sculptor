import {DFlowDependencies, DFlowReactiveService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Flow, LiteralValue,
    Mutation,
    NamespacesProjectsFlowsCreateInput,
    NamespacesProjectsFlowsCreatePayload,
    NamespacesProjectsFlowsDeleteInput,
    NamespacesProjectsFlowsDeletePayload,
    NamespacesProjectsFlowsUpdateInput,
    NamespacesProjectsFlowsUpdatePayload,
    NodeFunction, NodeParameter,
    Query, ReferenceValue
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import flowsQuery from "@edition/flow/services/queries/Flows.query.graphql";
import flowCreateMutation from "@edition/flow/services/mutations/Flow.create.mutation.graphql";
import flowDeleteMutation from "@edition/flow/services/mutations/Flow.delete.mutation.graphql";
import flowUpdateMutation from "@edition/flow/services/mutations/Flow.update.mutation.graphql";
import {View} from "@code0-tech/pictor/dist/utils/view";


export class FlowService extends DFlowReactiveService {

    private readonly client: GraphqlClient
    private flowUpdateQueue: Array<Flow["id"]>
    private i

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<Flow>>) {
        super(store)
        this.client = client
        this.flowUpdateQueue = []
        this.i = 0
    }

    values(dependencies?: DFlowDependencies): Flow[] {
        const flows = super.values()
        if (!dependencies?.namespaceId || !dependencies.projectId) return flows

        const namespaceId = dependencies.namespaceId
        const projectId = dependencies.projectId
        const filtered = flows.filter(flow => flow.project?.id === projectId)

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
                        this.set(this.i++, new View(flow))
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
        await this.syncFlow(flowId)
    }


    async deleteNodeById(flowId: Flow["id"], nodeId: NodeFunction["id"]): Promise<void> {
        await super.deleteNodeById(flowId, nodeId)
        await this.syncFlow(flowId)
    }


    async setParameterValue(flowId: Flow["id"], nodeId: NodeFunction["id"], parameterId: NodeParameter["id"], value?: LiteralValue | ReferenceValue | NodeFunction): Promise<void> {
        await super.setParameterValue(flowId, nodeId, parameterId, value)
        await this.syncFlow(flowId)
    }

    private async syncFlow(flowId: Flow["id"]) {

        const alreadyQueued = this.flowUpdateQueue.includes(flowId)
        if (alreadyQueued) return Promise.resolve()

        this.flowUpdateQueue.push(flowId)

        setTimeout(async () => {
            const flow = this.values().find(f => f.id === flowId)
            const flowInput = this.getPayloadById(flowId)

            if (!flow || !flowInput || !flowId) return Promise.reject()

            await this.flowUpdate({
                flowId: flowId,
                flowInput: flowInput
            })

            this.flowUpdateQueue.splice(this.flowUpdateQueue.indexOf(flowId), 1)
        }, 1000*60) // 1 min
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
                this.add(new View(flow))
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

        const flow = this.getById(payload.flowId)

        if (!flow) return Promise.reject()

        const result = await this.client.mutate<Mutation, NamespacesProjectsFlowsUpdateInput>({
            mutation: flowUpdateMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesProjectsFlowsUpdate && result.data.namespacesProjectsFlowsUpdate.flow) {
            const flowIndex = this.values().findIndex(f => f.id === payload.flowId)
            flow.updatedAt = result.data.namespacesProjectsFlowsUpdate.flow.updatedAt
            flow.editedAt = undefined
            this.set(flowIndex, new View(flow))
        }

        return result.data?.namespacesProjectsFlowsUpdate ?? undefined
    }

}