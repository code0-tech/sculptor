import {
    ReactiveArrayService,
    ReactiveArrayStore
} from "@code0-tech/pictor"
import {
    Mutation, Namespace,
    NamespaceMember,
    NamespacesMembersAssignRolesInput,
    NamespacesMembersAssignRolesPayload,
    NamespacesMembersDeleteInput,
    NamespacesMembersDeletePayload,
    NamespacesMembersInviteInput,
    NamespacesMembersInvitePayload,
    Query, User
} from "@code0-tech/sagittarius-graphql-types"
import {GraphqlClient} from "@core/util/graphql-client"
import membersQuery from "./queries/Members.query.graphql"
import memberAssignRoleMutation from "./mutations/Member.assignRoles.mutation.graphql"
import memberDeleteMutation from "./mutations/Member.delete.mutation.graphql"
import memberInviteMutation from "./mutations/Member.invite.mutation.graphql"
import {View} from "@code0-tech/pictor/dist/utils/view";
import {MemberView} from "@edition/member/services/Member.view";

export type MemberDependencies = {
    namespaceId: Namespace['id']
}

export class MemberService extends ReactiveArrayService<MemberView, MemberDependencies> {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<MemberView>>) {
        super(store)
        this.client = client
    }

    values(dependencies?: MemberDependencies): MemberView[] {
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
                        this.set(this.i++, new View(new MemberView(member)))
                    }
                })
            })
        }

        return filtered
    }

    hasById(id: NamespaceMember["id"]): boolean {
        const member = super.values().find(o => o.id === id)
        return member !== undefined
    }

    getById(id: NamespaceMember['id'], dependencies?: MemberDependencies): MemberView | undefined {
        return this.values(dependencies).find(member => member && member.id === id);
    }

    getByNamespaceIdAndUserId(namespaceId: Namespace['id'], userId: User['id']): MemberView | undefined {
        return this.values({namespaceId: namespaceId}).find(member => member.namespace?.id === namespaceId && member.user?.id === userId)
    }

    async memberAssignRoles(payload: NamespacesMembersAssignRolesInput): Promise<NamespacesMembersAssignRolesPayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesMembersAssignRolesInput>({
            mutation: memberAssignRoleMutation,
            variables: {
                ...payload
            }
        })

        //TODO: should be done by a new query
        if (result.data && result.data.namespacesMembersAssignRoles) {
            const currentMember = this.getById(payload.memberId)
            const index = super.values().findIndex(m => m.id === payload.memberId)

            const newMember = new MemberView({
                ...currentMember?.json(),
                roles: {
                    count: payload.roleIds.length,
                    nodes: payload.roleIds.map(roleId => ({ id: roleId }))
                }
            })

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
            const index = this.values().findIndex(m => m.id === member.id)
            this.delete(index)
        }

        return result.data?.namespacesMembersDelete ?? undefined
    }

    async memberInvite(payload: NamespacesMembersInviteInput): Promise<NamespacesMembersInvitePayload | undefined> {
        const result = await this.client.mutate<Mutation, NamespacesMembersInviteInput>({
            mutation: memberInviteMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.namespacesMembersInvite && result.data.namespacesMembersInvite.namespaceMember) {
            const member = result.data.namespacesMembersInvite.namespaceMember
            this.set(this.i++, new View(new MemberView(member)))
        }

        return result.data?.namespacesMembersInvite ?? undefined
    }

}