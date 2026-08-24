import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    ExecutionResult,
    FlowInput,
    FlowSetting,
    FlowType,
    FunctionDefinition,
    InlineReferenceValue,
    LiteralValue,
    Maybe,
    Mutation,
    Namespace,
    NamespaceProject,
    NamespacesProjectsFlowsCreateInput,
    NamespacesProjectsFlowsCreatePayload,
    NamespacesProjectsFlowsDeleteInput,
    NamespacesProjectsFlowsDeletePayload,
    NamespacesProjectsFlowsTriggerExecutionInput,
    NamespacesProjectsFlowsTriggerExecutionPayload,
    NamespacesProjectsFlowsUpdateInput,
    NamespacesProjectsFlowsUpdatePayload,
    NodeFunction,
    NodeParameter,
    NodeParameterValue,
    NodeParameterValueInput,
    Query,
    ReferencePathInput,
    ReferenceValue,
    SubFlowValue
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import flowsQuery from "@edition/flow/services/queries/Flows.query.graphql";
import flowQuery from "@edition/flow/services/queries/Flow.query.graphql";
import flowCreateMutation from "@edition/flow/services/mutations/Flow.create.mutation.graphql";
import flowDeleteMutation from "@edition/flow/services/mutations/Flow.delete.mutation.graphql";
import flowUpdateMutation from "@edition/flow/services/mutations/Flow.update.mutation.graphql";
import flowTriggerExecutionMutation from "@edition/flow/services/mutations/Flow.triggerExecution.mutation.graphql";
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

                    firstNodeResult: 50,
                    afterNodeResult: null
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

    protected removeParameterNode(flow: FlowView, node: NodeParameter, keep?: Set<string>): void {
        const value = node?.value
        if (value?.__typename === "SubFlowValue") {
            this.removeSubFlowNodes(flow, value, keep)
        } else if (value?.__typename === "LiteralValue") {
            (value.references ?? []).forEach(reference => {
                if (reference?.value?.__typename === "SubFlowValue") {
                    this.removeSubFlowNodes(flow, reference.value as SubFlowValue, keep)
                }
            })
        }
    }

    private removeSubFlowNodes(flow: FlowView, subFlow: SubFlowValue, keep?: Set<string>): void {
        if (subFlow?.startingNodeId && keep?.has(subFlow.startingNodeId)) return

        const parameterNode = flow?.nodes?.nodes?.find(n => n?.id === subFlow?.startingNodeId)
        if (!parameterNode) return

        flow!.nodes!.nodes = flow!.nodes!.nodes!.filter(n => n?.id !== subFlow?.startingNodeId)
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
            this.removeParameterNode(flow, p!!, keep)
        })
    }

    private collectStartingNodeIds(value?: Maybe<NodeParameterValue>): Set<string> {
        const ids = new Set<string>()
        if (!value) return ids
        if (value.__typename === "SubFlowValue" && value.startingNodeId) {
            ids.add(value.startingNodeId)
        } else if (value.__typename === "LiteralValue") {
            (value.references ?? []).forEach(reference => {
                if (reference?.value?.__typename === "SubFlowValue" && (reference.value as SubFlowValue).startingNodeId) {
                    ids.add((reference.value as SubFlowValue).startingNodeId!)
                }
            })
        }
        return ids
    }

    getNodeById(flowId: FlowView['id'], nodeId: NodeFunction['id']): NodeFunction | undefined {
        return this.getById(flowId)?.nodes?.nodes?.find(node => node?.id === nodeId)!!
    }

    getPayloadById(flowId: FlowView['id']): FlowInput {
        return this.getPayload(this.getById(flowId))
    }

    getPayload(flow: FlowView | undefined): FlowInput {
        const payload: FlowInput = {
            name: flow?.name!,
            type: flow?.type?.id!,
            settings: flow?.settings?.nodes?.map(setting => {
                return {
                    value: setting?.value ?? null,
                }
            }) ?? [],
            signature: flow?.signature,
            nodes: (flow?.nodes?.nodes ?? []).map(node => ({
                id: node?.id!,
                nextNodeId: node?.nextNodeId!,
                functionDefinitionId: node?.functionDefinition?.id!,
                parameters: (node?.parameters?.nodes ?? []).map(parameter => {
                    const parameterValue = parameter?.value

                    if (parameterValue?.__typename === "LiteralValue" && parameterValue.references && parameterValue.references.length > 0) {
                        return {
                            value: {
                                literalValue: {
                                    value: parameterValue.value!,
                                    references: parameterValue.references.map(reference => ({
                                        signature: reference?.signature ?? "",
                                        value: this.mapParameterValue(reference?.value),
                                    })),
                                },
                            },
                        }
                    }

                    return {
                        value: this.mapParameterValue(parameterValue),
                    }
                }),
            })),
            startingNodeId: flow?.startingNodeId!,
        }

        return payload
    }

    private mapParameterValue(value?: Maybe<NodeParameterValue>): NodeParameterValueInput {
        switch (value?.__typename) {
            case "SubFlowValue":
                return {
                    subFlowValue: {
                        ...(
                            value.startingNodeId ? {
                                startingNodeId: value.startingNodeId
                            } : value.functionDefinition?.identifier ? {
                                functionIdentifier: value.functionDefinition.identifier,
                            } : {}
                        ),
                        signature: value.signature ?? "",
                        settings: value.settings?.map(setting => ({
                            defaultValue: setting?.defaultValue,
                            hidden: setting?.hidden,
                            identifier: setting.identifier!,
                            optional: setting?.optional,
                        }))
                    }
                }

            case "LiteralValue":
                return {literalValue: {value: value.value!}}

            case "ReferenceValue": {
                const v = value as ReferenceValue
                return {
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
            }

            default:
                return {literalValue: null}
        }
    }

    async deleteNodeById(flowId: FlowView['id'], nodeId: NodeFunction['id']): Promise<void> {
        const flow = this.getById(flowId)
        const node = this.getNodeById(flowId, nodeId)
        const previousNodes = flow?.nodes?.nodes?.find(n => n?.nextNodeId === nodeId)
        const index = this.values().findIndex(f => f.id === flowId)
        if (!flow || !node) return

        let parentNode: Maybe<NodeFunction> | undefined
        let parentParameter: Maybe<NodeParameter> | undefined
        let parentSubFlow: SubFlowValue | undefined
        let parentLiteral: LiteralValue | undefined
        let parentReference: InlineReferenceValue | undefined

        for (const candidate of flow.nodes?.nodes ?? []) {
            for (const parameter of candidate?.parameters?.nodes ?? []) {
                const value = parameter?.value
                if (value?.__typename === "SubFlowValue" && value.startingNodeId === nodeId) {
                    parentNode = candidate
                    parentParameter = parameter
                    parentSubFlow = value
                    break
                }
                if (value?.__typename === "LiteralValue") {
                    const reference = value.references?.find(r => r?.value?.__typename === "SubFlowValue" && (r.value as SubFlowValue).startingNodeId === nodeId)
                    if (reference) {
                        parentNode = candidate
                        parentParameter = parameter
                        parentLiteral = value
                        parentReference = reference
                        parentSubFlow = reference.value as SubFlowValue
                        break
                    }
                }
            }
            if (parentNode) break
        }

        flow.nodes!.nodes = flow.nodes!.nodes!.filter(n => n?.id !== nodeId)
        node.parameters?.nodes?.forEach(p => this.removeParameterNode(flow, p!!))


        if (previousNodes) {
            previousNodes.nextNodeId = node.nextNodeId
        } else {
            if (!parentNode) flow.startingNodeId = node.nextNodeId ?? undefined
        }

        if (parentSubFlow) {
            if (node.nextNodeId) {
                parentSubFlow.startingNodeId = node.nextNodeId
            } else if (parentLiteral && parentReference) {
                parentLiteral.references = (parentLiteral.references ?? []).filter(r => r !== parentReference)
                parentLiteral.value = (parentLiteral.value ?? []).filter((v: unknown) => v !== `\${${parentReference!.signature}}`)
            } else if (parentParameter) {
                parentParameter.value = undefined
            }
        }

        flow.editedAt = new Date().toISOString()

        this.set(index, new View(flow))
        await this.syncFlow(flowId)
    }

    async removeParameterMapping(flowId: FlowView['id'], parentNodeId: NodeFunction['id'], parameterIndex: number, referenceSignature?: string): Promise<void> {
        const flow = this.getById(flowId)
        const index = this.values().findIndex(f => f.id === flowId)
        if (!flow) return

        const node = flow.nodes?.nodes?.find(n => n?.id === parentNodeId)
        const parameter = node?.parameters?.nodes?.[parameterIndex]
        if (!parameter) return

        const value = parameter.value
        if (value?.__typename === "LiteralValue" && referenceSignature) {
            const reference = value.references?.find(r => r?.signature === referenceSignature)
            if (reference?.value?.__typename === "SubFlowValue") {
                this.removeSubFlowNodes(flow, reference.value as SubFlowValue)
            }
            value.references = (value.references ?? []).filter(r => r?.signature !== referenceSignature)
            value.value = (value.value ?? []).filter((v: unknown) => v !== `\${${referenceSignature}}`)
            if ((value.references?.length ?? 0) === 0) parameter.value = undefined
        } else if (value?.__typename === "SubFlowValue") {
            this.removeSubFlowNodes(flow, value)
            parameter.value = undefined
        }

        flow.editedAt = new Date().toISOString()

        this.set(index, new View(flow))
        await this.syncFlow(flowId)
    }

    addNodeById(flowId: FlowView['id'], node: NodeFunction): NodeFunction['id'] {
        const flow = this.getById(flowId)
        const index = this.values().findIndex(f => f.id === flowId)

        if (!flow) return

        const nextNodeIndex: number = Math.max(0, ...flow.nodes?.nodes?.map(node => Number(node?.id?.match(/NodeFunction\/(\d+)$/)?.[1] ?? 0)) ?? [0])
        const nextNodeId: NodeFunction['id'] = `gid://sagittarius/NodeFunction/${nextNodeIndex + 1}`
        const addingNode: NodeFunction = {
            ...JSON.parse(JSON.stringify(node)),
            id: nextNodeId,
        }

        flow.nodes?.nodes?.push(addingNode)
        this.set(index, new View(flow))

        return addingNode.id

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

    async setSettingValue(flowId: FlowView['id'], parameterIndex: number, value: FlowSetting['value'], flowType: FlowType): Promise<void> {
        const flow = this.getById(flowId)
        const index = this.values().findIndex(f => f.id === flowId)
        if (!flow) return

        if (!flow.settings) {
            flow.settings = {
                nodes: []
            }
        }

        if (!flow.settings.nodes) {
            flow.settings.nodes = []
        }

        flow.settings.nodes = flowType?.flowTypeSettings?.nodes?.map((flowTypeSetting, index) => {
            const flowSetting = flow.settings?.nodes?.[index]
            if (!flowSetting) {
                return {
                    __typename: 'FlowSetting',
                    value: flowTypeSetting?.defaultValue !== null && flowTypeSetting?.defaultValue !== undefined ? flowTypeSetting?.defaultValue : null,
                }
            }

            return flowSetting
        }) ?? []

        const setting: Maybe<FlowSetting> | undefined = flow.settings?.nodes?.[parameterIndex]

        if (!setting && flow.settings && flow.settings.nodes) {

            const localParameter: FlowSetting = {
                value: null
            }

            localParameter.value = value as FlowSetting['value']
            flow.editedAt = new Date().toISOString()
            flow.settings.nodes[parameterIndex] = (localParameter)

        } else if (setting) {
            setting.value = value as FlowSetting['value']
            flow.editedAt = new Date().toISOString()
        }

        this.set(index, new View(flow))
        await this.syncFlow(flowId)
    }

    async setParameterValue(flowId: FlowView['id'], nodeId: NodeFunction['id'], parameterIndex: number, value?: LiteralValue | ReferenceValue | SubFlowValue, functionDefinition?: FunctionDefinition): Promise<void> {

        const flow = this.getById(flowId)
        const index = this.values().findIndex(f => f.id === flowId)
        if (!flow) return
        const node = this.getNodeById(flowId, nodeId)
        if (!node) return

        if (!node.parameters) {
            node.parameters = {
                nodes: []
            }
        }

        if (!node.parameters.nodes) {
            node.parameters.nodes = []
        }

        node.parameters.nodes = functionDefinition?.parameterDefinitions?.nodes?.map((nodeParameterDefinition, index) => {
            const nodeParameter = node.parameters?.nodes?.[index]
            if (!nodeParameter) {
                return {
                    __typename: "NodeParameter",
                    value: nodeParameterDefinition?.defaultValue !== null && nodeParameterDefinition?.defaultValue !== undefined ? nodeParameterDefinition?.defaultValue : null,
                }
            }

            return nodeParameter
        }) ?? []

        const parameter = node.parameters?.nodes?.[parameterIndex]
        if (!parameter && node.parameters && node.parameters.nodes) {

            const localParameter: NodeParameter = {
                __typename: "NodeParameter",
                value: null
            }

            localParameter.value = value as LiteralValue | ReferenceValue | SubFlowValue
            flow.editedAt = new Date().toISOString()
            node.parameters.nodes[parameterIndex] = (localParameter)

        } else if (parameter) {
            this.removeParameterNode(flow, parameter, this.collectStartingNodeIds(value))
            parameter.value = value as LiteralValue | ReferenceValue | SubFlowValue
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
            const mutationFlow = result.data.namespacesProjectsFlowsCreate.flow
            if (!this.hasById(mutationFlow.id) && mutationFlow?.project?.id && mutationFlow?.project?.namespace?.id) {

                this.client.query<Query>({
                    query: flowQuery,
                    variables: {
                        namespaceId: mutationFlow.project.namespace.id,
                        projectId: mutationFlow?.project.id,
                        flowId: mutationFlow.id,

                        firstNode: 50,
                        afterNode: null,

                        firstNodeParameter: 50,
                        afterNodeParameter: null,

                        firstSetting: 50,
                        afterSetting: null,

                        firstNodeResult: 50,
                        afterNodeResult: null
                    }
                }).then(res => {
                    const flow = res.data?.namespace?.project?.flow
                    this.add(new View(flow!))
                })
            } else {
                mutationFlow.nodes = {nodes: []}
                this.add(new View(mutationFlow))
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

    async flowUpdate(payload: NamespacesProjectsFlowsUpdateInput, force?: boolean): Promise<NamespacesProjectsFlowsUpdatePayload | undefined> {

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

            if (force) {
                this.client.query<Query>({
                    query: flowQuery,
                    fetchPolicy: "network-only",
                    variables: {
                        namespaceId: flow?.project?.namespace?.id,
                        projectId: flow?.project?.id,
                        flowId: flow?.id,

                        firstNode: 50,
                        afterNode: null,

                        firstNodeParameter: 50,
                        afterNodeParameter: null,

                        firstSetting: 50,
                        afterSetting: null,

                        firstNodeResult: 50,
                        afterNodeResult: null
                    }
                }).then(res => {
                    const lflow = res.data?.namespace?.project?.flow! as FlowView
                    lflow.updatedAt = Date.now().toString()
                    lflow.editedAt = undefined
                    this.set(flowIndex, new View(lflow!))
                })
            } else {
                flow.updatedAt = Date.now().toString()
                flow.editedAt = undefined
                this.set(flowIndex, new View(flow))
            }
        }

        return result.data?.namespacesProjectsFlowsUpdate ?? undefined
    }

    async triggerExecution(payload: NamespacesProjectsFlowsTriggerExecutionInput): Promise<NamespacesProjectsFlowsTriggerExecutionPayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesProjectsFlowsTriggerExecutionInput>({
            mutation: flowTriggerExecutionMutation,
            variables: {
                ...payload
            }
        })

        return result.data?.namespacesProjectsFlowsTriggerExecution ?? undefined
    }

    addExecutionResult(flowId: FlowView['id'], executionResult: ExecutionResult): void {
        const flow = this.getById(flowId)
        const index = this.values().findIndex(f => f.id === flowId)
        if (!flow || index < 0) return

        const existingNodes = flow.executionResults?.nodes ?? []
        if (existingNodes.some(node => node?.id === executionResult.id)) return

        flow.executionResults = {
            __typename: "ExecutionResultConnection",
            ...flow.executionResults,
            count: (flow.executionResults?.count ?? 0) + 1,
            nodes: [...existingNodes, executionResult],
        }

        this.set(index, new View(flow))
    }

}