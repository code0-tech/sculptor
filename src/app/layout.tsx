"use client";

import {DFullScreen} from "@code0-tech/pictor";
import {ApolloClient, HttpLink, InMemoryCache} from "@apollo/client";
import {ApolloProvider} from "@apollo/client/react";


const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        uri: "/graphql",
    }),
});

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
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
