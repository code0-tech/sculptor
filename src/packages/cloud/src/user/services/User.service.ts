import {UserService as CEUserService} from "@ce-internal/user/services/User.service";
import {
    Mutation,
    UsersCompleteGuestProfileInput,
    UsersCompleteGuestProfilePayload
} from "@code0-tech/sagittarius-graphql-types";
import {View} from "@code0-tech/pictor/dist/utils/view";
import completeGuestProfileMutation
    from "@cloud-internal/user/services/mutations/User.completeGuestProfile.mutation.graphql";

export class UserService extends CEUserService {

    async usersCompleteGuestProfile(payload: UsersCompleteGuestProfileInput): Promise<UsersCompleteGuestProfilePayload | undefined> {
        const result = await this.client.mutate<Mutation, UsersCompleteGuestProfileInput>({
            mutation: completeGuestProfileMutation,
            variables: {
                ...payload
            }
        })

        const user = result.data?.usersCompleteGuestProfile?.userSession?.user
        if (user && !this.hasById(user.id)) {
            this.add(new View(user))
        }

        return result.data?.usersCompleteGuestProfile ?? undefined
    }

}
