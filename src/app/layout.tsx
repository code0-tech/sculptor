"use client";

import {
    ApolloClient,
    ApolloLink,
    CombinedGraphQLErrors,
    CombinedProtocolErrors,
    HttpLink,
    InMemoryCache,
    ServerError,
    ServerParseError
} from "@apollo/client";
import {ApolloProvider} from "@apollo/client/react";
import React from "react";
import "./global.scss"
import {setContext} from "@apollo/client/link/context";
import {ErrorLink} from "@apollo/client/link/error";
import {useRouter} from "next/navigation";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const router = useRouter()


    const errorLink = new ErrorLink(({error, result, operation, forward}) => {
        if (error instanceof CombinedGraphQLErrors) {
            for (const gqlErr of error.errors) {

            }
        }

        if (error instanceof CombinedProtocolErrors) {
        }

        // 🔹 HTTP / Server Error (nicht 2xx)
        if (error instanceof ServerError) {
            const status = error.statusCode;
            if (status === 401) {
                localStorage.removeItem("ide_code-zero_session")
                router.push("/login")
            }
        }

        if (error instanceof ServerParseError) {
        }
    });

    const authMiddleware = setContext((_, {headers}) => {
        let token: string | undefined;
        try {
            const raw = localStorage.getItem("ide_code-zero_session");
            token = raw ? JSON.parse(raw)?.token : undefined;
        } catch {
        }
        return {
            headers: {
                ...headers,
                ...(token ? {authorization: `Session ${token}`} : {}),
            },
        };
    });

    const client = React.useMemo(() => new ApolloClient({
        cache: new InMemoryCache(),
        link: ApolloLink.from([errorLink, authMiddleware, new HttpLink({uri: "/graphql"})]),
    }), [authMiddleware]);

    return React.useMemo(() => {
        return <html>
        <body>
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
        </body>
        </html>
    }, [client, children])
}
