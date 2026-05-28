import {NamespaceService as CENamespaceService} from "@ce-internal/namespace/services/Namespace.service";
import {
    Mutation,
    Namespace,
    NamespacesLicensesCreateInput,
    NamespacesLicensesCreatePayload,
    NamespacesLicensesDeleteInput,
    NamespacesLicensesDeletePayload,
    Query
} from "@code0-tech/sagittarius-graphql-types";
import {View} from "@code0-tech/pictor/dist/utils/view";
import namespaceQuery from "@cloud-internal/namespace/services/queries/Namespace.query.graphql";
import namespaceLicenseCreateMutation from "@cloud-internal/namespace/services/mutations/Namespace.addLicense.mutation.graphql"
import namespaceLicenseDeleteMutation
    from "@cloud-internal/namespace/services/mutations/Namespace.removeLicense.mutation.graphql"

export class NamespaceService extends CENamespaceService {

    getById(id: Namespace["id"]): Namespace | undefined {
        if (this.values().find(namespace => namespace && namespace.id === id)) return this.values().find(namespace => namespace && namespace.id === id)
        this.client.query<Query>({
            query: namespaceQuery,
            variables: {
                id: id,

                firstLicense: 50,
                afterLicense: null
            },
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data.namespace) {
                this.add(new View(data.namespace))
            }
        })

        return this.values().find(namespace => namespace && namespace.id === id)
    }

    async namespaceLicenseAdd(payload: NamespacesLicensesCreateInput): Promise<NamespacesLicensesCreatePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesLicensesCreateInput>({
            mutation: namespaceLicenseCreateMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesLicensesCreate && result.data.namespacesLicensesCreate.license) {
            const namespace = this.getById(payload.namespaceId)
            const namespaceIndex = this.values().findIndex(namespace => namespace && namespace.id === payload.namespaceId)
            namespace!.licenses!.count = (namespace?.licenses?.count ?? 0) + 1
            namespace!.licenses?.nodes?.push(result.data.namespacesLicensesCreate.license)
            this.set(namespaceIndex, new View(namespace as Namespace))
        }

        return result.data?.namespacesLicensesCreate ?? undefined
    }

    async namespaceLicenseRemove(payload: NamespacesLicensesDeleteInput): Promise<NamespacesLicensesDeletePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesLicensesDeleteInput>({
            mutation: namespaceLicenseDeleteMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.licensesDelete && result.data.licensesDelete.license) {
            const namespace = this.values().find(namespace => namespace && namespace.licenses?.nodes?.map(license => license?.id).includes(payload.licenseId))
            const namespaceIndex = this.values().findIndex(namespace => namespace && namespace.licenses?.nodes?.map(license => license?.id).includes(payload.licenseId))
            namespace!.licenses!.count = (namespace?.licenses?.count ?? 0) - 1
            namespace!.licenses!.nodes = namespace?.licenses?.nodes?.filter(license => license?.id !== payload.licenseId) ?? []
            this.set(namespaceIndex, new View(namespace as Namespace))
        }

        return result.data?.namespacesLicensesDelete ?? undefined
    }

}