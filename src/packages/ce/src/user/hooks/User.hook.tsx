import {useSuspenseQuery} from "@apollo/client/react";
import {DUserView} from "@code0-tech/pictor";
import {Query, User} from "@code0-tech/sagittarius-graphql-types";
import usersQuery from "@edition/user/services/queries/Users.query.graphql";

export const useUsers = (): User[] => {
    const {data} = useSuspenseQuery<Query>(usersQuery)
    if (!data) return []

    const users: User[] = []
    if (data.currentUser) {
        users.push(new DUserView(data.currentUser))
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
    const users = useUsers()
    return users.find(u => u.id === id)
}

export const useUserByUsername = (username: string): User | undefined => {
    const users = useUsers()
    return users.find(u => u.username === username)
}