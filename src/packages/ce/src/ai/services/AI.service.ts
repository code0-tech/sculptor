import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Mutation,
    Query,
    VelorumGenerateFlowInput,
    VelorumGenerateFlowPayload,
    VelorumModel,
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import velorumModelsQuery from "./queries/AI.models.query.graphql";
import velorumGenerateFlowMutation from "./mutations/VelorumGenerateFlow.mutation.graphql";
import {Payload, View} from "@code0-tech/pictor/dist/utils/view";

export type Model = VelorumModel & Payload

export class AIService extends ReactiveArrayService<Model> {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<Model>>) {
        super(store)
        this.client = client
    }

    values(): VelorumModel[] {
        const models = super.values()
        if (models.length > 0) return models

        this.client.query<Query>({
            query: velorumModelsQuery,
        }).then(result => {
            const models = result.data?.velorum?.models ?? []
            models.forEach(model => {
                if (model && !this.hasById(model.identifier)) {
                    this.set(this.i++, new View(model as Model))
                }
            })
        })

        return super.values()
    }

    hasById(identifier: VelorumModel["identifier"]): boolean {
        return super.values().some(m => m.identifier === identifier)
    }

    async generateFlow(payload: VelorumGenerateFlowInput): Promise<VelorumGenerateFlowPayload | undefined> {
        const result = await this.client.mutate<Mutation, VelorumGenerateFlowInput>({
            mutation: velorumGenerateFlowMutation,
            variables: {...payload}
        })

        return result.data?.velorumGenerateFlow ?? undefined
    }

}
