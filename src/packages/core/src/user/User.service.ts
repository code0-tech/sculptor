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
import userQuery from "../user/queries/User.query.graphql";

export class UserService extends DUserReactiveService {

    private readonly client: GraphqlClient

    constructor(client: GraphqlClient, store: ReactiveArrayStore<DUserView>) {
        super(store);
        this.client = client
    }

    values(): DUserView[] {
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

        //store user session
        if (result.data && result.data.usersLogin && result.data.usersLogin.userSession) {
            this.createUserSession(result.data.usersLogin.userSession)
        }

        if (result.data && result.data.usersLogin && result.data.usersLogin.userSession?.user) {
            this.add(new DUserView(result.data.usersLogin.userSession.user))
        }

        return result.data?.usersLogin ?? undefined
    }

    usersLogout(payload: UsersLogoutInput): Promise<UsersLogoutPayload | undefined> {
        return Promise.resolve(undefined);
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