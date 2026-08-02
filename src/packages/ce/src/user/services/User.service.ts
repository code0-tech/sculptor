import {ReactiveArrayService, ReactiveArrayStore} from "@code0-tech/pictor";
import {
    Mutation,
    Query,
    User,
    UsersCreateInput,
    UsersCreatePayload,
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
    UsersRegisterPayload,
    UsersUpdateInput,
    UsersUpdatePayload
} from "@code0-tech/sagittarius-graphql-types";
import {GraphqlClient} from "@core/util/graphql-client";
import createMutation from "./mutations/User.create.mutation.graphql";
import updateMutation from "./mutations/User.update.mutation.graphql";
import loginMutation from "./mutations/User.login.mutation.graphql";
import logoutMutation from "./mutations/User.logout.mutation.graphql";
import registerMutation from "./mutations/User.register.mutation.graphql";
import identityLoginMutation from "./mutations/User.identityLogin.mutation.graphql";
import identityRegisterMutation from "./mutations/User.identityRegister.mutation.graphql";
import identityLinkMutation from "./mutations/User.identityLink.mutation.graphql";
import identityUnlinkMutation from "./mutations/User.identityUnlink.mutation.graphql";
import emailVerificationMutation from "./mutations/User.emailVerification.mutation.graphql";
import passwordResetMutation from "./mutations/User.passwordReset.mutation.graphql"
import passwordResetRequestMutation from "./mutations/User.passwordResetRequest.mutation.graphql"
import mfaTotpGenerateSecretMutation from "./mutations/User.mfaTotpGenerateSecret.mutation.graphql"
import mfaTotpValidateSecretMutation from "./mutations/User.mfaTotpValidateSecret.mutation.graphql"
import mfaBackupCodesRotateMutation from "./mutations/User.mfaBackupCodesRotate.mutation.graphql"
import usersQuery from "./queries/Users.query.graphql";
import currentUserQuery from "./queries/User.current.query.graphql";
import userByUsernameQuery from "./queries/User.byUsername.query.graphql";
import userByIdQuery from "./queries/User.byId.query.graphql";
import {View} from "@code0-tech/pictor/dist/utils/view";

export class UserService extends ReactiveArrayService<User> {

    private readonly client: GraphqlClient
    private i = 0;

    constructor(client: GraphqlClient, store: ReactiveArrayStore<View<User>>) {
        super(store);
        this.client = client
    }

    values(): User[] {
        if (super.values().length > 0) return super.values();
        this.client.query<Query>({
            query: usersQuery,
            variables: {
                firstUser: 50,
                afterUser: null,
                firstIdentity: 50,
                afterIdentity: null,
                firstSession: 50,
                afterSession: null,
                firstNamespaceMembership: 50,
                afterNamespaceMembership: null,
            }
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data && data.currentUser) {
                const currentUser = data.currentUser
                const index = super.values().findIndex(user => user && user.id === currentUser.id)
                this.set(index >= 0 ? index : this.i++, new View(currentUser))
            }
            if (data.users && data.users.nodes) {
                data.users.nodes.forEach((user) => {
                    if (user && !(user.id === data.currentUser?.id) && !this.hasById(user.id)) this.set(this.i++, new View(user))
                })
            }
        })
        return super.values();
    }

    async refetchCurrentUser(): Promise<User | undefined> {
        const result = await this.client.query<Query>({
            query: currentUserQuery,
            variables: {
                firstIdentity: 50,
                afterIdentity: null,
                firstSession: 50,
                afterSession: null,
                firstNamespaceMembership: 50,
                afterNamespaceMembership: null,
            },
            fetchPolicy: "network-only"
        })

        const currentUser = result.data?.currentUser
        if (!currentUser) return undefined

        const index = super.values().findIndex(user => user && user.id === currentUser.id)
        this.set(index >= 0 ? index : this.i++, new View(currentUser))

        return currentUser
    }

    getById(id: User["id"]): User | undefined {
        const user = super.values().find(user => user && user.id === id)
        if (user) return user

        if (id) {
            this.client.query<Query>({
                query: userByIdQuery,
                variables: {
                    id: id
                }
            }).then(result => {
                const data = result.data
                if (!data) return

                if (data && data.user && !this.hasById(data.user.id)) this.set(this.i++, new View(data.user))
            })
        }

        return this.values().find(user => user && user.id === id)
    }

    getByUsername(username: User["username"]): User | undefined {
        if (this.values().find(user => user && user.username === username)) return this.values().find(user => user && user.username === username)

        this.client.query<Query>({
            query: userByUsernameQuery,
            variables: {
                username: username ?? ""
            }
        }).then(result => {
            const data = result.data
            if (!data) return

            if (data && data.user && !this.hasById(data.user.id)) this.set(this.i++, new View(data.user))
        })

        return this.values().find(user => user && user.username === username)
    }

    deleteById(id: User["id"]): void {
        const index = this.values().findIndex(user => user.id === id)
        this.delete(index)
    }

    hasById(id: User["id"]): boolean {
        const user = super.values().find(u => u.id === id);
        return user !== undefined;
    }

    async usersCreate(payload: UsersCreateInput): Promise<UsersCreatePayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersCreateInput>({
            mutation: createMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.usersCreate && result.data.usersCreate.user && !this.hasById(result.data.usersCreate.user.id)) {
            this.add(new View(result.data.usersCreate.user))
        }

        return result.data?.usersCreate ?? undefined
    }

    async usersUpdate(payload: UsersUpdateInput): Promise<UsersUpdatePayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersUpdateInput>({
            mutation: updateMutation,
            variables: {
                ...payload
            }
        })

        if (result.data?.usersUpdate?.user) this.mergeUser(result.data.usersUpdate.user)

        return result.data?.usersUpdate ?? undefined
    }

    /**
     * Merges a user returned from a mutation into the store. Mutations return the
     * UserBasic fragment, which omits connection fields (namespaceMemberships,
     * identities, sessions), so those are preserved from the existing entry.
     */
    private mergeUser(updatedUser: User): void {
        const index = super.values().findIndex(user => user.id === updatedUser.id)
        if (index >= 0) {
            const existingUser = super.values()[index]
            this.set(index, new View({
                ...existingUser,
                ...updatedUser,
                namespaceMemberships: existingUser.namespaceMemberships,
                identities: existingUser.identities,
                sessions: existingUser.sessions,
            }))
        } else if (!this.hasById(updatedUser.id)) this.add(new View(updatedUser))
    }

    async usersEmailVerification(payload: UsersEmailVerificationInput): Promise<UsersEmailVerificationPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersEmailVerificationInput>({
            mutation: emailVerificationMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.usersEmailVerification && result.data.usersEmailVerification.user && this.hasById(result.data.usersEmailVerification.user.id)) {
            //const existingUser = this.getById(result.data.usersEmailVerification.user.id)
            //TODO: existingUser?.emailVerifiedAt = result.data.usersEmailVerification.user.emailVerifiedAt
        }

        return result.data?.usersEmailVerification ?? undefined
    }

    async usersIdentityLink(payload: UsersIdentityLinkInput): Promise<UsersIdentityLinkPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersIdentityLinkInput>({
            mutation: identityLinkMutation,
            variables: {
                ...payload
            }
        })

        return result.data?.usersIdentityLink ?? undefined
    }

    async usersIdentityLogin(payload: UsersIdentityLoginInput): Promise<UsersIdentityLoginPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersIdentityLoginInput>({
            mutation: identityLoginMutation,
            variables: {
                ...payload
            }
        })

        const user = result.data?.usersIdentityLogin?.userSession?.user
        if (user && !this.hasById(user.id)) {
            this.add(new View(user))
        }

        return result.data?.usersIdentityLogin ?? undefined
    }

    async usersIdentityRegister(payload: UsersIdentityRegisterInput): Promise<UsersIdentityRegisterPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersIdentityRegisterInput>({
            mutation: identityRegisterMutation,
            variables: {
                ...payload
            }
        })

        const user = result.data?.usersIdentityRegister?.userSession?.user
        if (user && !this.hasById(user.id)) {
            this.add(new View(user))
        }

        return result.data?.usersIdentityRegister ?? undefined
    }

    async usersIdentityUnlink(payload: UsersIdentityUnlinkInput): Promise<UsersIdentityUnlinkPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersIdentityUnlinkInput>({
            mutation: identityUnlinkMutation,
            variables: {
                ...payload
            }
        })

        const removed = result.data?.usersIdentityUnlink?.userIdentity
        if (removed && (result.data?.usersIdentityUnlink?.errors?.length ?? 0) <= 0) {
            const index = super.values().findIndex(user => user?.identities?.nodes?.some(identity => identity?.id === removed.id))
            const user = index >= 0 ? super.values()[index] : undefined
            if (user?.identities) {
                this.set(index, new View({
                    ...user,
                    identities: {
                        ...user.identities,
                        count: Math.max((user.identities.count ?? 1) - 1, 0),
                        nodes: user.identities.nodes?.filter(identity => identity?.id !== removed.id) ?? []
                    }
                }))
            }
        }

        return result.data?.usersIdentityUnlink ?? undefined
    }

    async usersLogin(payload: UsersLoginInput): Promise<UsersLoginPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersLoginInput>({
            mutation: loginMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.usersLogin && result.data.usersLogin.userSession?.user && !this.hasById(result.data.usersLogin.userSession?.user.id)) {
            this.add(new View(result.data.usersLogin.userSession.user))
        }

        return result.data?.usersLogin ?? undefined
    }

    async usersLogout(payload: UsersLogoutInput): Promise<UsersLogoutPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersLogoutInput>({
            mutation: logoutMutation,
            variables: {
                ...payload
            }
        })

        const loggedOutSession = result.data?.usersLogout?.userSession
        if (loggedOutSession && (result.data?.usersLogout?.errors?.length ?? 0) <= 0) {
            const index = super.values().findIndex(user => user?.sessions?.nodes?.some(session => session?.id === loggedOutSession.id))
            const user = index >= 0 ? super.values()[index] : undefined
            if (user?.sessions) {
                this.set(index, new View({
                    ...user,
                    sessions: {
                        ...user.sessions,
                        count: Math.max((user.sessions.count ?? 1) - 1, 0),
                        nodes: (user.sessions.nodes ?? []).filter(session => session?.id !== loggedOutSession.id)
                    }
                }))
            }
        }

        return result.data?.usersLogout ?? undefined
    }

    async usersMfaBackupCodesRotate(payload: UsersMfaBackupCodesRotateInput): Promise<UsersMfaBackupCodesRotatePayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersMfaBackupCodesRotateInput>({
            mutation: mfaBackupCodesRotateMutation,
            variables: {
                ...payload
            }
        })

        const data = result.data?.usersMfaBackupCodesRotate ?? undefined
        // The acting user's remaining backup code count changed — refresh it in the store.
        if (data?.codes && (data.errors?.length ?? 0) <= 0) {
            await this.refetchCurrentUser()
        }

        return data
    }

    async usersMfaTotpGenerateSecret(payload: UsersMfaTotpGenerateSecretInput): Promise<UsersMfaTotpGenerateSecretPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersMfaTotpGenerateSecretInput>({
            mutation: mfaTotpGenerateSecretMutation,
            variables: {
                ...payload
            }
        })

        return result.data?.usersMfaTotpGenerateSecret ?? undefined
    }

    async usersMfaTotpValidateSecret(payload: UsersMfaTotpValidateSecretInput): Promise<UsersMfaTotpValidateSecretPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersMfaTotpValidateSecretInput>({
            mutation: mfaTotpValidateSecretMutation,
            variables: {
                ...payload
            }
        })

        const data = result.data?.usersMfaTotpValidateSecret ?? undefined
        if (data?.user && (data.errors?.length ?? 0) <= 0) {
            this.mergeUser(data.user)
        }

        return data
    }

    async usersPasswordReset(payload: UsersPasswordResetInput): Promise<UsersPasswordResetPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersPasswordResetInput>({
            mutation: passwordResetMutation,
            variables: {
                ...payload
            }
        })

        return result.data?.usersPasswordReset ?? undefined
    }

    async usersPasswordResetRequest(payload: UsersPasswordResetRequestInput): Promise<UsersPasswordResetRequestPayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersPasswordResetRequestInput>({
            mutation: passwordResetRequestMutation,
            variables: {
                ...payload
            }
        })

        return result.data?.usersPasswordResetRequest ?? undefined
    }

    async usersRegister(payload: UsersRegisterInput): Promise<UsersRegisterPayload | undefined> {

        const result = await this.client.mutate<Mutation, UsersRegisterInput>({
            mutation: registerMutation,
            variables: {
                ...payload
            }
        })

        if (result.data && result.data.usersRegister && result.data.usersRegister.userSession?.user && !this.hasById(result.data.usersRegister.userSession?.user.id)) {
            this.add(new View(result.data.usersRegister.userSession.user))
        }

        return result.data?.usersRegister ?? undefined
    }

}