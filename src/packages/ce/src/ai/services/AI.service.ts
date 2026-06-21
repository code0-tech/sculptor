import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    AiGenerateFlowInput, AiGenerateFlowPayload,
    AiModel,
    Mutation,
    Query
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import velorumGenerateFlowMutation from "./mutations/AI.generateFlow.mutation.graphql";
import {Payload, View} from "@code0-tech/pictor/dist/utils/view";
import velorumModelsQuery from "./queries/AI.models.query.graphql";

export type Model = AiModel & Payload

export class AIService extends ReactiveArrayService<Model> {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<Model>>) {
        super(store)
        this.client = client
    }

    values(): Model[] {
        const models = super.values()
        if (models.length > 0) return models

        this.client.query<Query>({
            query: velorumModelsQuery,
        }).then(result => {
            const models = result.data?.ai?.models ?? []
            models.forEach(model => {
                if (model && !this.hasById(model.identifier)) {
                    this.set(this.i++, new View(model as Model))
                }
            })
        })

        return super.values()
    }

    hasById(identifier: Model["identifier"]): boolean {
        return super.values().some(m => m.identifier === identifier)
    }

    async generateFlow(payload: AiGenerateFlowInput): Promise<AiGenerateFlowPayload | undefined> {
        const result = await this.client.mutate<Mutation, AiGenerateFlowInput>({
            mutation: velorumGenerateFlowMutation,
            variables: {...payload}
        })

        return result.data?.aiGenerateFlow ?? undefined
    }

}
