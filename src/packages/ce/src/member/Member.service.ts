import {
    DMemberDependencies,
    DNamespaceMemberReactiveService,
    DNamespaceMemberView,
    ReactiveArrayStore
} from "@code0-tech/pictor"
import {
    Namespace,
    NamespaceMember,
    NamespacesMembersAssignRolesInput,
    NamespacesMembersAssignRolesPayload,
    NamespacesMembersDeleteInput,
    NamespacesMembersDeletePayload,
    NamespacesMembersInviteInput,
    NamespacesMembersInvitePayload,
    Query,
    User
} from "@code0-tech/sagittarius-graphql-types"
import {GraphqlClient} from "@core/util/graphql-client"
import membersQuery from "./queries/Members.query.graphql"

export class MemberService extends DNamespaceMemberReactiveService {

    private readonly client: GraphqlClient
    private i = 0

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DNamespaceMemberView>) {
        super(store)
        this.client = client
    }

    getByNamespaceIdAndUserId(namespaceId: Namespace["id"], userId: User["id"]): DNamespaceMemberView | undefined {
        if (super.getByNamespaceIdAndUserId(namespaceId, userId)) return super.getByNamespaceIdAndUserId(namespaceId, userId)

        this.client.query<Query>({
            query: membersQuery,
            variables: {
                namespaceId: namespaceId,
                firstMember: 50,
                afterMember: null,
                firstRole: 50,
                afterRole: null,
            }
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data.namespace && data.namespace.members && data.namespace.members.nodes) {
                data.namespace.members.nodes.forEach((member) => {
                    if (member) this.set(this.i++, new DNamespaceMemberView(member))
                })
            }
        })

        return super.getByNamespaceIdAndUserId(namespaceId, userId)
    }

    values(dependencies?: DMemberDependencies): DNamespaceMemberView[] {
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
                        this.set(this.i++, new DNamespaceMemberView(member))
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

    memberAssignRoles(payload: NamespacesMembersAssignRolesInput): Promise<NamespacesMembersAssignRolesPayload | undefined> {
        return Promise.resolve(undefined)
    }

    memberDelete(payload: NamespacesMembersDeleteInput): Promise<NamespacesMembersDeletePayload | undefined> {
        return Promise.resolve(undefined)
    }

    memberInvite(payload: NamespacesMembersInviteInput): Promise<NamespacesMembersInvitePayload | undefined> {
        return Promise.resolve(undefined)
    }

}