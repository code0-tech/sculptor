import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    FlowInput,
    FlowSetting,
    LiteralValue,
    Maybe,
    Mutation,
    Namespace,
    NamespaceProject,
    NamespacesProjectsFlowsCreateInput,
    NamespacesProjectsFlowsCreatePayload,
    NamespacesProjectsFlowsDeleteInput,
    NamespacesProjectsFlowsDeletePayload,
    NamespacesProjectsFlowsUpdateInput,
    NamespacesProjectsFlowsUpdatePayload,
    NodeFunction,
    NodeFunctionIdWrapper,
    NodeParameter,
    NodeParameterValueInput, ParameterDefinition,
    Query,
    ReferencePathInput,
    ReferenceValue,
    Scalars
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import flowsQuery from "@edition/flow/services/queries/Flows.query.graphql";
import flowCreateMutation from "@edition/flow/services/mutations/Flow.create.mutation.graphql";
import flowDeleteMutation from "@edition/flow/services/mutations/Flow.delete.mutation.graphql";
import flowUpdateMutation from "@edition/flow/services/mutations/Flow.update.mutation.graphql";
import {View} from "@code0-tech/pictor/dist/utils/view";
import {FlowView} from "@edition/flow/services/Flow.view";

export type FlowDependencies = {
    namespaceId: Namespace['id']
    projectId: NamespaceProject['id']
}

export class FlowService extends ReactiveArrayService<FlowView, FlowDependencies> {

    private readonly client: GraphqlClient
    private flowUpdateQueue: Array<FlowView["id"]>
    private i

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<FlowView>>) {
        super(store)
        this.client = client
        this.flowUpdateQueue = []
        this.i = 0
    }

    values(dependencies?: FlowDependencies): FlowView[] {
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

    hasById(id: FlowView["id"]): boolean {
        const flow = super.values().find(f => f.id === id)
        return flow !== undefined
    }

    getById(id: FlowView['id'], dependencies?: FlowDependencies): FlowView | undefined {
        return this.values(dependencies).find(value => value.id === id);
    }

    protected removeParameterNode(flow: FlowView, parameter: NodeParameter): void {
        if (parameter?.value?.__typename === "NodeFunctionIdWrapper") {
            const parameterNode = flow?.nodes?.nodes?.find(n => n?.id === (parameter.value as NodeFunction)?.id)
            if (parameterNode) {
                flow!.nodes!.nodes = flow!.nodes!.nodes!.filter(n => n?.id !== (parameter.value as NodeFunction)?.id)
                let nextNodeId = parameterNode.nextNodeId
                while (nextNodeId) {
                    const nextNode = flow!.nodes!.nodes!.find(n => n?.id === nextNodeId)
                    if (nextNode) {
                        flow!.nodes!.nodes = flow!.nodes!.nodes!.filter(n => n?.id !== nextNodeId)
                        nextNodeId = nextNode.nextNodeId
                    } else {
                        nextNodeId = null
                    }
                }
                parameterNode.parameters?.nodes?.forEach(p => {
                    this.removeParameterNode(flow, p!!)
                })
            }
        }
    }

    getLinkedNodesById(flowId: FlowView['id'], nodeId: NodeFunction['id']): NodeFunction[] {
        const parentNode = this.getNodeById(flowId, nodeId)
        //const nextNodes = parentNode ? this.getLinkedNodesById(flowId, parentNode.nextNodeId) : []
        const parameterNodes: NodeFunction[] = []
        parentNode?.parameters?.nodes?.forEach(p => {
            if (p?.value?.__typename === "NodeFunctionIdWrapper") {
                const parameterNode = this.getNodeById(flowId, (p.value as NodeFunctionIdWrapper)?.id!!)
                if (parameterNode) {
                    parameterNodes.push(parameterNode)
                    //parameterNodes.push(...(parameterNode ? this.getLinkedNodesById(flowId, parameterNode.nextNodeId) : []))
                }
            }
        })
        return [...(parentNode ? [parentNode] : []), ...parameterNodes]
    }

    getNodeById(flowId: FlowView['id'], nodeId: NodeFunction['id']): NodeFunction | undefined {
        return this.getById(flowId)?.nodes?.nodes?.find(node => node?.id === nodeId)!!
    }

    getPayloadById(flowId: FlowView['id']): FlowInput {
        const flow = this.getById(flowId)

        return {
            name: flow?.name!,
            type: flow?.type?.id!,
            settings: flow?.settings?.nodes?.map(setting => {
                return {
                    flowSettingIdentifier: setting?.flowSettingIdentifier!,
                    value: setting?.value!,
                }
            }) ?? [],
            nodes: (flow?.nodes?.nodes ?? []).map(node => ({
                id: node?.id!,
                nextNodeId: node?.nextNodeId!,
                functionDefinitionId: node?.functionDefinition?.id!,
                parameters: (node?.parameters?.nodes ?? []).map(parameter => {
                    let value: NodeParameterValueInput

                    switch (parameter?.value?.__typename) {
                        case "NodeFunctionIdWrapper":
                            value = {nodeFunctionId: parameter.value.id!}
                            break

                        case "LiteralValue":
                            value = {literalValue: parameter.value.value!}
                            break

                        case "ReferenceValue": {
                            const v = parameter.value as ReferenceValue
                            value = {
                                referenceValue: {
                                    ...(v.nodeFunctionId ? {nodeFunctionId: v.nodeFunctionId} : {}),
                                    ...("parameterIndex" in v && "inputIndex" in v ?
                                        {
                                            parameterIndex: v.parameterIndex,
                                            inputIndex: v.inputIndex
                                        } : {}),
                                    referencePath: v.referencePath?.map(referencePath => {
                                        const reference: ReferencePathInput = {
                                            path: referencePath.path
                                        }
                                        return reference
                                    }) ?? [],
                                },
                            }
                            break
                        }

                        default:
                            value = {literalValue: null}
                    }

                    return {
                        parameterDefinitionId: parameter?.parameterDefinition?.id!,
                        value,
                    }
                }),
            })),
            startingNodeId: flow?.startingNodeId!,
        }
    }

    async deleteNodeById(flowId: FlowView['id'], nodeId: NodeFunction['id']): Promise<void> {
        const flow = this.getById(flowId)
        const node = this.getNodeById(flowId, nodeId)
        const parentNode = flow?.nodes?.nodes?.find(node => node?.parameters?.nodes?.find(p => p?.value?.__typename === "NodeFunctionIdWrapper" && (p.value as NodeFunction)?.id === nodeId))
        const previousNodes = flow?.nodes?.nodes?.find(n => n?.nextNodeId === nodeId)
        const index = this.values().findIndex(f => f.id === flowId)
        if (!flow || !node) return

        flow.nodes!.nodes = flow.nodes!.nodes!.filter(n => n?.id !== nodeId)
        node.parameters?.nodes?.forEach(p => this.removeParameterNode(flow, p!!))


        if (previousNodes) {
            previousNodes.nextNodeId = node.nextNodeId
        } else {
            if (!parentNode) flow.startingNodeId = node.nextNodeId ?? undefined
        }

        if (parentNode) {
            const parameter = parentNode.parameters?.nodes?.find(p => p?.value?.__typename === "NodeFunctionIdWrapper" && (p.value as NodeFunction)?.id === nodeId)
            if (parameter) {
                parameter.value = undefined
            }
        }

        flow.editedAt = new Date().toISOString()

        this.set(index, new View(flow))
        await this.syncFlow(flowId)
    }

    async addNextNodeById(flowId: FlowView['id'], parentNodeId: NodeFunction['id'] | null, nextNode: NodeFunction): Promise<void> {

        const flow = this.getById(flowId)
        const index = this.values().findIndex(f => f.id === flowId)
        const parentNode = parentNodeId ? this.getNodeById(flowId, parentNodeId) : undefined

        if (!flow || (parentNodeId && !parentNode)) return

        const nextNodeIndex: number = Math.max(0, ...flow.nodes?.nodes?.map(node => Number(node?.id?.match(/NodeFunction\/(\d+)$/)?.[1] ?? 0)) ?? [0])
        const nextNodeId: NodeFunction['id'] = `gid://sagittarius/NodeFunction/${nextNodeIndex + 1}`
        const addingNode: NodeFunction = {
            ...JSON.parse(JSON.stringify(nextNode)),
            id: nextNodeId,
        }

        if (parentNode && parentNode.nextNodeId) {
            addingNode.nextNodeId = parentNode.nextNodeId
        } else if (!parentNode && flow.startingNodeId) {
            addingNode.nextNodeId = flow.startingNodeId
        }

        flow.nodes?.nodes?.push(addingNode)

        if (parentNode) {
            parentNode.nextNodeId = addingNode.id
        } else {
            flow.startingNodeId = addingNode.id
        }

        flow.editedAt = new Date().toISOString()

        this.set(index, new View(flow))
        await this.syncFlow(flowId)
    }

    async setSettingValue(flowId: FlowView['id'], settingIdentifier: Maybe<Scalars['String']['output']>, value: FlowSetting['value']): Promise<void> {
        const flow = this.getById(flowId)
        const index = this.values().findIndex(f => f.id === flowId)
        if (!flow) return

        flow.editedAt = new Date().toISOString()

        const setting: Maybe<FlowSetting> | undefined = flow.settings?.nodes?.find(s => s?.flowSettingIdentifier === settingIdentifier)

        if (!setting) {
            const localSetting = {
                flowSettingIdentifier: settingIdentifier,
                value: null
            }
            localSetting.value = value
            if (flow.settings && flow.settings.nodes)
                flow.settings.nodes.push(localSetting)
            else {
                flow.settings = {nodes: [localSetting]}
            }
        } else {
            setting.value = value
        }

        this.set(index, new View(flow))
        await this.syncFlow(flowId)
    }

    async setParameterValue(flowId: FlowView['id'], nodeId: NodeFunction['id'], parameterIndex: number, value?: LiteralValue | ReferenceValue | NodeFunction, parameterDefinitionId?: ParameterDefinition['id']): Promise<void> {
        const flow = this.getById(flowId)
        const index = this.values().findIndex(f => f.id === flowId)
        if (!flow) return
        const node = this.getNodeById(flowId, nodeId)
        if (!node) return
        const parameter = node.parameters?.nodes?.[parameterIndex]
        if (!parameter && parameterDefinitionId) {
            //TODO: needs a parameterDefinitionId
            const localParameter: NodeParameter = {
                __typename: "NodeParameter",
                parameterDefinition: {
                    __typename: "ParameterDefinition",
                    id: parameterDefinitionId
                },
                value: null
            }

            if (value?.__typename === "NodeFunction") {
                const nextNodeIndex: number = Math.max(0, ...flow.nodes?.nodes?.map(node => Number(node?.id?.match(/NodeFunction\/(\d+)$/)?.[1] ?? 0)) ?? [0])
                const addingIdValue: NodeFunction = {
                    ...value,
                    id: `gid://sagittarius/NodeFunction/${nextNodeIndex + 1}`
                }
                flow.nodes?.nodes?.push(addingIdValue)
                localParameter.value = {
                    id: `gid://sagittarius/NodeFunction/${nextNodeIndex + 1}`,
                    __typename: "NodeFunctionIdWrapper"
                } as NodeFunctionIdWrapper
            } else {
                localParameter.value = value as LiteralValue | ReferenceValue
            }

            flow.editedAt = new Date().toISOString()

            node.parameters?.nodes?.push(localParameter)
        } else if (parameter) {
            this.removeParameterNode(flow, parameter)
            if (value?.__typename === "NodeFunction") {
                const nextNodeIndex: number = Math.max(0, ...flow.nodes?.nodes?.map(node => Number(node?.id?.match(/NodeFunction\/(\d+)$/)?.[1] ?? 0)) ?? [0])
                const addingIdValue: NodeFunction = {
                    ...value,
                    id: `gid://sagittarius/NodeFunction/${nextNodeIndex + 1}`
                }
                flow.nodes?.nodes?.push(addingIdValue)
                parameter.value = {
                    id: `gid://sagittarius/NodeFunction/${nextNodeIndex + 1}`,
                    __typename: "NodeFunctionIdWrapper"
                } as NodeFunctionIdWrapper
            } else {
                parameter.value = value as LiteralValue | ReferenceValue
            }

            flow.editedAt = new Date().toISOString()
        }


        this.set(index, new View(flow))
        await this.syncFlow(flowId)
    }

    private async syncFlow(flowId: FlowView["id"]) {

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
        }, 1000 * 60) // 1 min
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