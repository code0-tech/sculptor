import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Application as SApplication,
    ApplicationSettingsUpdateInput,
    ApplicationSettingsUpdatePayload,
    Mutation,
    Query
} from "@code0-tech/sagittarius-graphql-types";
import {Payload, View} from "@code0-tech/pictor/dist/utils/view";
import {GraphqlClient} from "@core/util/graphql-client";
import applicationQuery from "@edition/application/services/queries/Application.query.graphql"
import applicationUpdateMutation from "@edition/application/services/mutations/Application.update.mutation.graphql"

export type Application = SApplication & Payload

export class ApplicationService extends ReactiveArrayService<Application> {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<Application>>) {
        super(store);
        this.client = client
    }


    get(): SApplication {

        const application = super.get(0)

        if (!application) {
            this.client.query<Query>({
                query: applicationQuery
            }).then(res => {
                const app = res.data?.application
                if (app) this.set(0, new View(app as Application))
            })
        }

        return application

    }

    async applicationUpdate(payload: ApplicationSettingsUpdateInput): Promise<ApplicationSettingsUpdatePayload | undefined> {
        const result = await this.client.mutate<Mutation, ApplicationSettingsUpdateInput>({
            mutation: applicationUpdateMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.applicationSettingsUpdate && result.data.applicationSettingsUpdate.applicationSettings) {
            const application = this.get()
            this.set(0, new View({
                ...application,
                legalNoticeUrl: result.data.applicationSettingsUpdate.applicationSettings.legalNoticeUrl,
                privacyUrl: result.data.applicationSettingsUpdate.applicationSettings.privacyUrl,
                termsAndConditionsUrl: result.data.applicationSettingsUpdate.applicationSettings.termsAndConditionsUrl,
                settings: {
                    ...result.data.applicationSettingsUpdate.applicationSettings
                }
            } as Application))

        }

        return result.data?.applicationSettingsUpdate ?? undefined
    }
}