"use client";

import {DFullScreen} from "@code0-tech/pictor";
import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from "@apollo/client";
import {ApolloProvider} from "@apollo/client/react";
import {UserSession} from "@code0-tech/sagittarius-graphql-types";
import React from "react";
import "./global.scss"
import Image from "next/image";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const [token, setToken] = React.useState<string | null>(null);

    const authMiddleware = React.useMemo(() => new ApolloLink((operation, forward) => {
        if (token) {
            operation.setContext({
                headers: {
                    authorization: token
                }
            })
        }
        return forward(operation);
    }), [token]);

    React.useEffect(() => {
        const userSession = JSON.parse(localStorage.getItem("ide_code-zero_session")!!) as UserSession
        if (userSession && userSession.token) setToken(userSession.token)
    }, [])

    const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: ApolloLink.from([authMiddleware, new HttpLink({uri: "/graphql"})]),
    });

    return (
        <html>
        <body>
        <ApolloProvider client={client}>
            <DFullScreen>
                {children}
            </DFullScreen>
        </ApolloProvider>
        </body>
        </html>
    );
}
