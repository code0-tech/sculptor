import login from "../user/mutations/User.login.mutation.graphql"
import {ApolloClient} from "@apollo/client";

export const mutate = (client: ApolloClient) => {
    return client.mutate({
        mutation: login,
        variables: {
            email: "nsammito@code0.tech",
            password: "123456"
        }
    })
}