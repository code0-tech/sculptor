import {DOrganizationReactiveService, DOrganizationView, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Mutation,
    Organization,
    OrganizationsCreateInput,
    OrganizationsCreatePayload,
    OrganizationsDeleteInput,
    OrganizationsDeletePayload, Query
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import createOrganizationMutation from "./mutations/Organization.create.mutation.graphql";
import organizationQuery from "./queries/Organization.query.graphql";

export class OrganizationService extends DOrganizationReactiveService {

    private readonly client: GraphqlClient
    private i = 0;

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DOrganizationView>) {
        super(store);
        this.client = client
    }

    values(): DOrganizationView[] {
        if (super.values().length > 0) return super.values();
        this.client.query<Query>({
            query: organizationQuery
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data.organizations && data.organizations.nodes) {
                data.organizations.nodes.forEach((organization) => {
                    if (organization && !this.hasById(organization.id)) this.set(this.i++, new DOrganizationView(organization))
                })
            }
        })
        return super.values();
    }

    deleteById(id: Organization["id"]): void {
        const index = this.values().findIndex(o => o.id === id)
        this.delete(index)
    }

    hasById(id: Organization["id"]): boolean {
        const organization = super.values().find(o => o.id === id)
        return organization !== undefined
    }

    async organizationCreate(payload: OrganizationsCreateInput): Promise<OrganizationsCreatePayload | undefined> {
        const result = await this.client.mutate<Mutation, OrganizationsCreateInput>({
            mutation: createOrganizationMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.organizationsCreate && result.data.organizationsCreate.organization) {
            const organization = result.data.organizationsCreate.organization
            if (!this.hasById(organization.id)) {
                this.add(new DOrganizationView(organization))
            }
        }

        return result.data?.organizationsCreate ?? undefined
    }

    async organizationDelete(payload: OrganizationsDeleteInput): Promise<OrganizationsDeletePayload | undefined> {
        return Promise.resolve(undefined)
    }

}