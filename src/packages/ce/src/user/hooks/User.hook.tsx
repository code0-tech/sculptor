import {useSuspenseQuery} from "@apollo/client/react";
import {Query, User} from "@code0-tech/sagittarius-graphql-types";
import usersQuery from "@edition/user/services/queries/Users.query.graphql";
import userByIdQuery from "@edition/user/services/queries/User.byId.query.graphql";
import userByUsernameQuery from "@edition/user/services/queries/User.byUsername.query.graphql";

export const useUsers = (): User[] => {
    const {data} = useSuspenseQuery<Query>(usersQuery)
    if (!data) return []

    const users: User[] = []
    if (data.currentUser) {
        users.push(data.currentUser)
    }
    if (data.users && data.users.nodes) {
        data.users.nodes.forEach((user) => {
            if (user && !(user.id === data.currentUser?.id)) {
                users.push(user)
            }
        })
    }
    return users

}

export const useUserById = (id: User['id']): User | undefined => {
    const {data} = useSuspenseQuery<Query>(userByIdQuery, {
        variables: {
            id: id
        }
    })

    return data.user!
}

export const useUserByUsername = (username: User["username"]): User | undefined => {
    const {data} = useSuspenseQuery<Query>(userByUsernameQuery, {
        variables: {
            username: username ?? ""
        }
    })

    return data.user!
}