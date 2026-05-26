import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Application as SApplication,
    ApplicationSettingsUpdateInput,
    ApplicationSettingsUpdatePayload,
    LicensesCreateInput,
    LicensesCreatePayload, LicensesDeleteInput, LicensesDeletePayload,
    Mutation,
    Query
} from "@code0-tech/sagittarius-graphql-types";
import {Payload, View} from "@code0-tech/pictor/dist/utils/view";
import {GraphqlClient} from "@core/util/graphql-client";
import applicationQuery from "@edition/application/services/queries/Application.query.graphql"
import applicationUpdateMutation from "@edition/application/services/mutations/Application.update.mutation.graphql"
import applicationLicenseAddMutation from "@ee/application/services/mutations/Application.addLicense.mutation.graphql"
import applicationLicenseRemoveMutation from "@ee/application/services/mutations/Application.removeLicense.mutation.graphql"

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
                query: applicationQuery,
                variables: {
                    firstLicense: 50,
                    afterLicense: null
                }
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

    async applicationLicenseAdd(payload: LicensesCreateInput): Promise<LicensesCreatePayload | undefined> {
        const result = await this.client.mutate<Mutation, LicensesCreateInput>({
            mutation: applicationLicenseAddMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.licensesCreate && result.data.licensesCreate.license) {
            const application = this.get()
            application!.licenses!.count = (application.licenses?.count ?? 0) + 1
            application.licenses?.nodes?.push(result.data.licensesCreate.license)
            this.set(0, new View(application as Application))
        }

        return result.data?.licensesCreate ?? undefined
    }

    async applicationLicenseRemove(payload: LicensesDeleteInput): Promise<LicensesDeletePayload | undefined> {
        const result = await this.client.mutate<Mutation, LicensesDeleteInput>({
            mutation: applicationLicenseRemoveMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.licensesDelete && result.data.licensesDelete.license) {
            const application = this.get()
            application!.licenses!.count = (application.licenses?.count ?? 0) - 1
            application.licenses!.nodes = application.licenses?.nodes?.filter(license => license?.id !== payload.licenseId) ?? []
            this.set(0, new View(application as Application))
        }

        return result.data?.licensesDelete ?? undefined
    }
}