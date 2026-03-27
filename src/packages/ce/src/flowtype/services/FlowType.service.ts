import {
    ReactiveArrayService,
    ReactiveArrayStore
} from "@code0-tech/pictor";
import {GraphqlClient} from "@core/util/graphql-client";
import {FlowType, Namespace, NamespaceProject, Query, Runtime} from "@code0-tech/sagittarius-graphql-types";
import flowTypesQuery from "@edition/flowtype/services/queries/FlowTypes.query.graphql"
import {View} from "@code0-tech/pictor/dist/utils/view";

export type FlowTypeDependencies = {
    namespaceId?: Namespace['id']
    projectId?: NamespaceProject['id']
    runtimeId?: Runtime['id']
}

export class FlowTypeService extends ReactiveArrayService<FlowType, FlowTypeDependencies> {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<FlowType>>) {
        super(store)
        this.client = client
    }

    values(dependencies?: FlowTypeDependencies): FlowType[] {
        const functions = super.values()
        if (!dependencies?.runtimeId) return functions

        const namespaceId = dependencies.namespaceId
        const projectId = dependencies.projectId
        const runtimeId = dependencies.runtimeId
        const filtered = functions.filter(flowType => flowType.runtime?.id === runtimeId)

        if (filtered.length <= 0 && namespaceId && projectId) {
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
                        this.set(this.i++, new View(flowType))
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

    getById(id: FlowType['id'], dependencies?: FlowTypeDependencies): FlowType | undefined {
        return this.values(dependencies).find(value => value.id === id);
    }

}