import {DNamespaceMemberReactiveService, DNamespaceMemberView, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    NamespacesMembersAssignRolesInput,
    NamespacesMembersAssignRolesPayload,
    NamespacesMembersDeleteInput,
    NamespacesMembersDeletePayload,
    NamespacesMembersInviteInput,
    NamespacesMembersInvitePayload
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";

export class MemberService extends DNamespaceMemberReactiveService {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DNamespaceMemberView>) {
        super(store);
        this.client = client
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