import {
    LicensesCreateInput,
    LicensesCreatePayload,
    LicensesDeleteInput,
    LicensesDeletePayload,
    Mutation
} from "@code0-tech/sagittarius-graphql-types";
import {View} from "@code0-tech/pictor/dist/utils/view";
import applicationLicenseAddMutation from "@ee-internal/application/services/mutations/Application.addLicense.mutation.graphql"
import applicationLicenseRemoveMutation
    from "@ee-internal/application/services/mutations/Application.removeLicense.mutation.graphql"

import {Application as CEApplication, ApplicationService as CEApplicationService} from "@ce-internal/application/services/Application.service"

export type Application = CEApplication

export class ApplicationService extends CEApplicationService {

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