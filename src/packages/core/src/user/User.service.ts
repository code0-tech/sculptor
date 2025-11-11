import {DUserReactiveService, DUserView, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Query,
    User,
    UsersEmailVerificationInput,
    UsersEmailVerificationPayload,
    UsersIdentityLinkInput,
    UsersIdentityLinkPayload,
    UsersIdentityLoginInput,
    UsersIdentityLoginPayload,
    UsersIdentityRegisterInput,
    UsersIdentityRegisterPayload,
    UsersIdentityUnlinkInput,
    UsersIdentityUnlinkPayload,
    UsersLoginInput,
    UsersLoginPayload,
    UsersLogoutInput,
    UsersLogoutPayload,
    UsersMfaBackupCodesRotateInput,
    UsersMfaBackupCodesRotatePayload,
    UsersMfaTotpGenerateSecretInput,
    UsersMfaTotpGenerateSecretPayload,
    UsersMfaTotpValidateSecretInput,
    UsersMfaTotpValidateSecretPayload,
    UsersPasswordResetInput,
    UsersPasswordResetPayload,
    UsersPasswordResetRequestInput,
    UsersPasswordResetRequestPayload,
    UsersRegisterInput,
    UsersRegisterPayload
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import loginMutation from "../user/mutations/User.login.mutation.graphql";
import logoutMutation from "../user/mutations/User.logout.mutation.graphql";
import userQuery from "../user/queries/User.query.graphql";

export class UserService extends DUserReactiveService {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DUserView>) {
        super(store);
        this.client = client
    }

    values(): DUserView[] {
        if (super.values().length > 0) return super.values();
        this.client.query<Query>({
            query: userQuery
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data && data.currentUser) this.add(new DUserView(data.currentUser))
            if (data.users && data.users.nodes) {
                for (const user of data.users.nodes) {
                    if (user) this.add(new DUserView(user))
                }
            }
        })

        return super.values();
    }

    getById(id: User["id"]): DUserView | undefined {
        return super.getById(id);
    }

    deleteById(id: User["id"]): void {
        const index = this.values().findIndex(user => user.id === id)
        this.delete(index)
    }

    hasById(id: User["id"]): boolean {
        const user = this.getById(id);
        return user !== undefined;
    }

    /** @alpha **/
    usersEmailVerification(payload: UsersEmailVerificationInput): Promise<UsersEmailVerificationPayload | undefined> {
        return Promise.resolve(undefined);
    }

    /** @alpha **/
    usersIdentityLink(payload: UsersIdentityLinkInput): Promise<UsersIdentityLinkPayload | undefined> {
        return Promise.resolve(undefined);
    }

    /** @alpha **/
    usersIdentityLogin(payload: UsersIdentityLoginInput): Promise<UsersIdentityLoginPayload | undefined> {
        return Promise.resolve(undefined);
    }

    /** @alpha **/
    usersIdentityRegister(payload: UsersIdentityRegisterInput): Promise<UsersIdentityRegisterPayload | undefined> {
        return Promise.resolve(undefined);
    }

    /** @alpha **/
    usersIdentityUnlink(payload: UsersIdentityUnlinkInput): Promise<UsersIdentityUnlinkPayload | undefined> {
        return Promise.resolve(undefined);
    }

    async usersLogin(payload: UsersLoginInput): Promise<UsersLoginPayload | undefined> {
        const result = await this.client.mutate<{ usersLogin: UsersLoginPayload }, UsersLoginInput>({
            mutation: loginMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.usersLogin && result.data.usersLogin.userSession?.user && !this.hasById(result.data.usersLogin.userSession?.user.id)) {
            this.add(new DUserView(result.data.usersLogin.userSession.user))
        }

        return result.data?.usersLogin ?? undefined
    }

    async usersLogout(payload: UsersLogoutInput): Promise<UsersLogoutPayload | undefined> {
        const result = await this.client.mutate<{ usersLogout: UsersLogoutPayload }, UsersLogoutInput>({
            mutation: logoutMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.usersLogout.userSession && result.data.usersLogout.userSession.user) {
            this.deleteById(result.data.usersLogout.userSession.user.id)
        }

        return result.data?.usersLogout ?? undefined
    }

    /** @alpha **/
    usersMfaBackupCodesRotate(payload: UsersMfaBackupCodesRotateInput): Promise<UsersMfaBackupCodesRotatePayload | undefined> {
        return Promise.resolve(undefined);
    }

    /** @alpha **/
    usersMfaTotpGenerateSecret(payload: UsersMfaTotpGenerateSecretInput): Promise<UsersMfaTotpGenerateSecretPayload | undefined> {
        return Promise.resolve(undefined);
    }

    /** @alpha **/
    usersMfaTotpValidateSecret(payload: UsersMfaTotpValidateSecretInput): Promise<UsersMfaTotpValidateSecretPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersPasswordReset(payload: UsersPasswordResetInput): Promise<UsersPasswordResetPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersPasswordResetRequest(payload: UsersPasswordResetRequestInput): Promise<UsersPasswordResetRequestPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersRegister(payload: UsersRegisterInput): Promise<UsersRegisterPayload | undefined> {
        return Promise.resolve(undefined);
    }

}