import {
    ReactiveArrayService,
    ReactiveArrayStore
} from "@code0-tech/pictor"
import {
    Mutation, Namespace,
    NamespaceMember,
    NamespacesMembersAssignRolesInput,
    NamespacesMembersAssignRolesPayload,
    NamespacesMembersBulkInviteInput,
    NamespacesMembersBulkInvitePayload,
    NamespacesMembersDeleteInput,
    NamespacesMembersDeletePayload,
    Query, User
} from "@code0-tech/sagittarius-graphql-types"
import {GraphqlClient} from "@core/util/graphql-client"
import membersQuery from "./queries/Members.query.graphql"
import memberAssignRoleMutation from "./mutations/Member.assignRoles.mutation.graphql"
import memberDeleteMutation from "./mutations/Member.delete.mutation.graphql"
import memberBulkInviteMutation from "./mutations/Member.bulkInvite.mutation.graphql"
import {View} from "@code0-tech/pictor/dist/utils/view";

export type MemberDependencies = {
    namespaceId: Namespace['id']
}

export class MemberService extends ReactiveArrayService<NamespaceMember, MemberDependencies> {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<NamespaceMember>>) {
        super(store)
        this.client = client
    }

    values(dependencies?: MemberDependencies): NamespaceMember[] {
        const members = super.values()
        if (!dependencies?.namespaceId) return members

        const namespaceId = dependencies.namespaceId
        const filtered = members.filter(m => m.namespace?.id === namespaceId)

        if (filtered.length <= 0) {
            this.client.query<Query>({
                query: membersQuery,
                variables: {
                    namespaceId: namespaceId,
                    firstMember: 50,
                    afterMember: null,
                    firstRole: 50,
                    afterRole: null,
                }
            }).then(res => {
                const nodes = res.data?.namespace?.members?.nodes ?? []
                nodes.forEach(member => {
                    if (member && !this.hasById(member.id)) {
                        this.add(new View(member))
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: NamespaceMember["id"]): boolean {
        const member = super.values().find(o => o?.id === id)
        return member !== undefined
    }

    getById(id: NamespaceMember['id'], dependencies?: MemberDependencies): NamespaceMember | undefined {
        return this.values(dependencies).find(member => member && member.id === id);
    }

    getByNamespaceIdAndUserId(namespaceId: Namespace['id'], userId: User['id']): NamespaceMember | undefined {
        return this.values({namespaceId: namespaceId}).find(member => member.namespace?.id === namespaceId && member.user?.id === userId)
    }

    async memberAssignRoles(payload: NamespacesMembersAssignRolesInput): Promise<NamespacesMembersAssignRolesPayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesMembersAssignRolesInput>({
            mutation: memberAssignRoleMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesMembersAssignRoles) {
            const currentMember = this.getById(payload.memberId)
            const index = super.values().findIndex(m => m?.id === payload.memberId)

            const newMember: NamespaceMember = {
                ...currentMember,
                roles: {
                    count: payload.roleIds.length,
                    nodes: payload.roleIds.map(roleId => ({ id: roleId }))
                }
            }

            this.set(index, new View(newMember))
        }

        return result.data?.namespacesMembersAssignRoles ?? undefined
    }

    async memberDelete(payload: NamespacesMembersDeleteInput): Promise<NamespacesMembersDeletePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesMembersDeleteInput>({
            mutation: memberDeleteMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesMembersDelete && result.data.namespacesMembersDelete.namespaceMember) {
            const member = result.data.namespacesMembersDelete.namespaceMember
            const index = super.values().findIndex(m => m?.id == member.id)
            if (index >= 0) this.delete(index)
        }

        return result.data?.namespacesMembersDelete ?? undefined
    }

    async memberBulkInvite(payload: NamespacesMembersBulkInviteInput): Promise<NamespacesMembersBulkInvitePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesMembersBulkInviteInput>({
            mutation: memberBulkInviteMutation,
            variables: {
                ...payload
            }
        })

        result.data?.namespacesMembersBulkInvite?.namespaceMembers?.forEach(member => {
            if (!this.hasById(member.id)) {
                this.add(new View(member))
            }
        })

        return result.data?.namespacesMembersBulkInvite ?? undefined
    }

}