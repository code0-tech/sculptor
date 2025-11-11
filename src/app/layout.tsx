"use client";

import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from "@apollo/client";
import {ApolloProvider} from "@apollo/client/react";
import React from "react";
import "./global.scss"
import {setContext} from "@apollo/client/link/context";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const authMiddleware = setContext((_, { headers }) => {
        let token: string | undefined;
        try {
            const raw = localStorage.getItem("ide_code-zero_session");
            token = raw ? JSON.parse(raw)?.token : undefined;
        } catch {}
        return {
            headers: {
                ...headers,
                ...(token ? { authorization: `Session ${token}` } : {}),
            },
        };
    });

    const client = React.useMemo(() => new ApolloClient({
        cache: new InMemoryCache(),
        link: ApolloLink.from([authMiddleware, new HttpLink({uri: "/graphql"})]),
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
