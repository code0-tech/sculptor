import {DRuntimeDependencies, DRuntimeReactiveService, DRuntimeView, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Mutation,
    Query,
    Runtime,
    RuntimesCreateInput,
    RuntimesCreatePayload,
    RuntimesDeleteInput,
    RuntimesDeletePayload,
    RuntimesRotateTokenInput,
    RuntimesRotateTokenPayload,
    RuntimesUpdateInput,
    RuntimesUpdatePayload
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import globalRuntimesQuery from "./queries/Runtime.global.query.graphql"
import namespaceRuntimesQuery from "./queries/Runtime.namespace.query.graphql"
import createRuntimeMutation from "./mutations/Runtime.create.mutation.graphql"
import updateRuntimeMutation from "./mutations/Runtime.update.mutation.graphql"
import deleteRuntimeMutation from "./mutations/Runtime.delete.mutation.graphql"
import rotateTokenRuntimeMutation from "./mutations/Runtime.rotateToken.mutation.graphql"

export class RuntimeService extends DRuntimeReactiveService {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DRuntimeView>) {
        super(store);
        this.client = client
    }

    hasById(id: Runtime["id"]): boolean {
        const runtime = super.values().find(o => o.id === id)
        return runtime !== undefined
    }

    values(dependencies?: DRuntimeDependencies): DRuntimeView[] {
        const runtimes = super.values()

        if (!dependencies?.namespaceId) {
            if (runtimes.length === 0) {
                this.client.query<Query>({
                    query: globalRuntimesQuery,
                    variables: {
                        firstRuntime: 50,
                        afterRuntime: null
                    },
                }).then(res => {
                    const nodes = res.data?.globalRuntimes?.nodes ?? []
                    nodes.forEach(runtime => {
                        if (runtime && !this.hasById(runtime.id)) {
                            this.set(this.i++, new DRuntimeView(runtime))
                        }
                    })
                })
            }

            return runtimes
        }

        const namespaceId = dependencies.namespaceId
        const filtered = runtimes.filter(r => r.namespace?.id === namespaceId)

        if (filtered.length === 0) {
            this.client.query<Query>({
                query: namespaceRuntimesQuery,
                variables: {
                    namespaceId,
                    firstRuntime: 50,
                    afterRuntime: null
                },
            }).then(res => {
                const nodes = res.data?.namespace?.runtimes?.nodes ?? []
                nodes.forEach(runtime => {
                    if (
                        runtime &&
                        runtime.namespace?.id === namespaceId &&
                        !this.hasById(runtime.id)
                    ) {
                        this.set(this.i++, new DRuntimeView(runtime))
                    }
                })
            })
        }

        return filtered
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

    async runtimeUpdate(payload: RuntimesUpdateInput): Promise<RuntimesUpdatePayload | undefined> {
        const result = await this.client.mutate<Mutation, RuntimesUpdateInput>({
            mutation: updateRuntimeMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.runtimesUpdate && result.data.runtimesUpdate.runtime) {
            const runtime = result.data.runtimesUpdate.runtime
            const index = this.values().findIndex(r => r.id === runtime.id)
            this.set(index, new DRuntimeView(runtime))

        }

        return result.data?.runtimesUpdate ?? undefined
    }

    async runtimeDelete(payload: RuntimesDeleteInput): Promise<RuntimesDeletePayload | undefined> {
        const result = await this.client.mutate<Mutation, RuntimesDeleteInput>({
            mutation: deleteRuntimeMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.runtimesDelete && result.data.runtimesDelete.runtime) {
            const runtime = result.data.runtimesDelete.runtime
            const index = this.values().findIndex(r => r.id === runtime.id)
            this.delete(index)

        }

        return result.data?.runtimesDelete ?? undefined
    }

    async runtimeRotateToken(payload: RuntimesRotateTokenInput): Promise<RuntimesRotateTokenPayload | undefined> {
        const result = await this.client.mutate<Mutation, RuntimesRotateTokenInput>({
            mutation: rotateTokenRuntimeMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.runtimesRotateToken && result.data.runtimesRotateToken.runtime) {
            const runtime = result.data.runtimesRotateToken.runtime
            const index = this.values().findIndex(r => r.id === runtime.id)
            this.set(index, new DRuntimeView(runtime))

        }

        return result.data?.runtimesRotateToken ?? undefined
    }

}