import {DUserReactiveService} from "@code0-tech/pictor";
import {
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

export class UserService extends DUserReactiveService {
    usersEmailVerification(payload: UsersEmailVerificationInput): Promise<UsersEmailVerificationPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersIdentityLink(payload: UsersIdentityLinkInput): Promise<UsersIdentityLinkPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersIdentityLogin(payload: UsersIdentityLoginInput): Promise<UsersIdentityLoginPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersIdentityRegister(payload: UsersIdentityRegisterInput): Promise<UsersIdentityRegisterPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersIdentityUnlink(payload: UsersIdentityUnlinkInput): Promise<UsersIdentityUnlinkPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersLogin(payload: UsersLoginInput): Promise<UsersLoginPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersLogout(payload: UsersLogoutInput): Promise<UsersLogoutPayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersMfaBackupCodesRotate(payload: UsersMfaBackupCodesRotateInput): Promise<UsersMfaBackupCodesRotatePayload | undefined> {
        return Promise.resolve(undefined);
    }

    usersMfaTotpGenerateSecret(payload: UsersMfaTotpGenerateSecretInput): Promise<UsersMfaTotpGenerateSecretPayload | undefined> {
        return Promise.resolve(undefined);
    }

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