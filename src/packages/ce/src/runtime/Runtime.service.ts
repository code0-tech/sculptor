import {
    DOrganizationView,
    DRuntimeDependencies,
    DRuntimeReactiveService,
    DRuntimeView,
    ReactiveArrayStore
} from "@code0-tech/pictor";
import {
    Mutation, Organization, OrganizationsCreateInput,
    Query,
    Runtime,
    RuntimesCreateInput,
    RuntimesCreatePayload,
    RuntimesDeleteInput,
    RuntimesDeletePayload, RuntimesRotateTokenInput, RuntimesRotateTokenPayload
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import globalRuntimesQuery from "./queries/Runtime.global.query.graphql"
import namespaceRuntimesQuery from "./queries/Runtime.namespace.query.graphql"
import createRuntimeMutation from "./mutations/Runtime.create.mutation.graphql"

export class RuntimeService extends DRuntimeReactiveService {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DRuntimeView>) {
        super(store);
        this.client = client
    }

    hasById(id: Runtime["id"]): boolean {
        const runtime = super.values().find(o => o.id === id)
        return runtime !== undefined
    }

    values(dependencies?: DRuntimeDependencies): DRuntimeView[] {
        if (super.values().length > 0) return super.values();

        let i = 0;

        this.client.query<Query>({
            query: globalRuntimesQuery,
            variables: {
                firstRuntime: 50,
                afterRuntime: null,
                firstDataType: 0,
                afterDataType: null,
                firstFlowType: 0,
                afterFlowType: null,
                firstProject: 0,
                afterProject: null,
            },
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data.globalRuntimes && data.globalRuntimes.nodes) {
                data.globalRuntimes.nodes.forEach((runtime) => {
                    if (runtime) this.set(i++, new DRuntimeView(runtime))
                })
            }
        })

        if (dependencies?.namespaceId) {
            this.client.query<Query>({
                query: namespaceRuntimesQuery,
                variables: {
                    namespaceId: dependencies.namespaceId
                }
            }).then(result => {
                const data = result.data
                if (!data) return

                if (data.namespace && data.namespace.runtimes && data.namespace.runtimes.nodes) {
                    data.namespace.runtimes.nodes.forEach((runtime) => {
                        if (runtime) this.set(i++, new DRuntimeView(runtime))
                    })
                }
            })
        }

        return super.values();
    }

    async runtimeCreate(payload: RuntimesCreateInput): Promise<RuntimesCreatePayload | undefined> {
        const result = await this.client.mutate<Mutation, RuntimesCreateInput>({
            mutation: createRuntimeMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.runtimesCreate && result.data.runtimesCreate.runtime) {
            const runtime = result.data.runtimesCreate.runtime
            if (!this.hasById(runtime.id)) {
                this.add(new DRuntimeView(runtime))
            }
        }

        return result.data?.runtimesCreate ?? undefined
    }

    runtimeDelete(payload: RuntimesDeleteInput): Promise<RuntimesDeletePayload | undefined> {
        return Promise.resolve(undefined);
    }

    runtimeRotateToken(payload: RuntimesRotateTokenInput): Promise<RuntimesRotateTokenPayload | undefined> {
        return Promise.resolve(undefined);
    }

}