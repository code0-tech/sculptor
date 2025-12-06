import {
    DNamespaceRoleReactiveService,
    DNamespaceRoleView,
    DRoleDependencies,
    ReactiveArrayStore
} from "@code0-tech/pictor"
import {
    Mutation,
    NamespaceRole,
    NamespacesRolesAssignAbilitiesInput,
    NamespacesRolesAssignAbilitiesPayload,
    NamespacesRolesAssignProjectsInput,
    NamespacesRolesAssignProjectsPayload,
    NamespacesRolesCreateInput,
    NamespacesRolesCreatePayload,
    NamespacesRolesDeleteInput,
    NamespacesRolesDeletePayload,
    Query
} from "@code0-tech/sagittarius-graphql-types"
import {GraphqlClient} from "@core/util/graphql-client";
import rolesQuery from "@edition/role/queries/Roles.query.graphql";
import roleAssignAbilitiesMutation from "@edition/role/mutations/Role.assignAbilities.mutation.graphql";

export class RoleService extends DNamespaceRoleReactiveService {

    private readonly client: GraphqlClient
    private i = 0;

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DNamespaceRoleView>) {
        super(store);
        this.client = client
    }

    values(dependencies: DRoleDependencies): DNamespaceRoleView[] {
        const roles = super.values()
        if (!dependencies?.namespaceId) return roles

        const namespaceId = dependencies.namespaceId
        const filtered = roles.filter(r => r.namespace?.id === namespaceId)

        if (filtered.length === 0) {
            this.client.query<Query>({
                query: rolesQuery,
                variables: {
                    namespaceId,
                    firstRole: 50,
                    afterRole: null,
                    firstProject: 50,
                    afterProject: null,
                },
            }).then(res => {
                const nodes = res.data?.namespace?.roles?.nodes ?? []
                nodes.forEach(role => {
                    if (
                        role &&
                        role.namespace?.id === namespaceId &&
                        !this.hasById(role.id)
                    ) {
                        this.set(this.i++, new DNamespaceRoleView(role))
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: NamespaceRole["id"]): boolean {
        const role = super.values().find(r => r.id === id)
        return role !== undefined
    }

    async roleAssignAbilities(payload: NamespacesRolesAssignAbilitiesInput): Promise<NamespacesRolesAssignAbilitiesPayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesRolesAssignAbilitiesInput>({
            mutation: roleAssignAbilitiesMutation,
            variables: {
                ...payload
            }
        })

        //TODO: should be done by a new query
        if (result.data && result.data.namespacesRolesAssignAbilities) {
            const currentRole = this.getById(payload.roleId)
            const index = super.values().findIndex(m => m.id === payload.roleId)

            const newRole = new DNamespaceRoleView({
                ...currentRole?.json(),
                abilities: payload.abilities
            })

            this.set(index, newRole)
        }

        return result.data?.namespacesRolesAssignAbilities ?? undefined
    }

    roleAssignProject(payload: NamespacesRolesAssignProjectsInput): Promise<NamespacesRolesAssignProjectsPayload | undefined> {
        throw new Error("Method not implemented.")
    }

    roleCreate(payload: NamespacesRolesCreateInput): Promise<NamespacesRolesCreatePayload | undefined> {
        throw new Error("Method not implemented.")
    }

    roleDelete(payload: NamespacesRolesDeleteInput): Promise<NamespacesRolesDeletePayload | undefined> {
        throw new Error("Method not implemented.")
    }

}