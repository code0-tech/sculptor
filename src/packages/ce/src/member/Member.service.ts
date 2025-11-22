import {DNamespaceMemberReactiveService, DNamespaceMemberView, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Namespace,
    NamespacesMembersAssignRolesInput,
    NamespacesMembersAssignRolesPayload,
    NamespacesMembersDeleteInput,
    NamespacesMembersDeletePayload,
    NamespacesMembersInviteInput,
    NamespacesMembersInvitePayload,
    Query,
    User
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import membersQuery from "./queries/Members.query.graphql"

export class MemberService extends DNamespaceMemberReactiveService {

    private readonly client: GraphqlClient
    private i = 0;

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DNamespaceMemberView>) {
        super(store);
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

    values(): DNamespaceMemberView[] {
        return super.values();
    }

    memberAssignRoles(payload: NamespacesMembersAssignRolesInput): Promise<NamespacesMembersAssignRolesPayload | undefined> {
        return Promise.resolve(undefined);
    }

    memberDelete(payload: NamespacesMembersDeleteInput): Promise<NamespacesMembersDeletePayload | undefined> {
        return Promise.resolve(undefined);
    }

    memberInvite(payload: NamespacesMembersInviteInput): Promise<NamespacesMembersInvitePayload | undefined> {
        return Promise.resolve(undefined);
    }

}