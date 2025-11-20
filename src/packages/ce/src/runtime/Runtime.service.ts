import {DOrganizationView, DRuntimeReactiveService, DRuntimeView, ReactiveArrayStore} from "@code0-tech/pictor";
import {
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

export class RuntimeService extends DRuntimeReactiveService {

    private readonly client: GraphqlClient
    private readonly namespaceId?: Runtime['id']

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DRuntimeView>, namespaceId?: Runtime['id']) {
        super(store);
        this.client = client
        this.namespaceId = namespaceId ?? undefined
    }

    values(): DRuntimeView[] {
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

        if (this.namespaceId) {
            this.client.query<Query>({
                query: namespaceRuntimesQuery,
                variables: {
                    namespaceId: this.namespaceId
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

    runtimeCreate(payload: RuntimesCreateInput): Promise<RuntimesCreatePayload | undefined> {
        return Promise.resolve(undefined);
    }

    runtimeDelete(payload: RuntimesDeleteInput): Promise<RuntimesDeletePayload | undefined> {
        return Promise.resolve(undefined);
    }

    runtimeRotateToken(payload: RuntimesRotateTokenInput): Promise<RuntimesRotateTokenPayload | undefined> {
        return Promise.resolve(undefined);
    }

}