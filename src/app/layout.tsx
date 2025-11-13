"use client";

import {
    ApolloClient,
    ApolloLink,
    CombinedGraphQLErrors,
    CombinedProtocolErrors,
    HttpLink,
    InMemoryCache, Observable,
    ServerError,
    ServerParseError
} from "@apollo/client";
import {ApolloProvider} from "@apollo/client/react";
import React from "react";
import "./global.scss"
import {setContext} from "@apollo/client/link/context";
import {ErrorLink} from "@apollo/client/link/error";
import {useRouter} from "next/navigation";
import {Toaster} from "sonner";
import {Error, MessageError} from "@code0-tech/sagittarius-graphql-types";
import {toast} from "@code0-tech/pictor";

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);

    console.error = (...args: unknown[]) => {
        console.log(args)
    }
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const router = useRouter()

    const toastHandler = (error: Error) => {
        toast({
            title: error.__typename === "ErrorCode" ? `${error.errorCode}` : "Error",
            children: error.__typename === "ErrorCode" ? null : error.__typename === "ActiveModelError" ? `${error.type}` : `${(error as MessageError).message}`,
            color: "error",
            dismissible: true,
        })
    }

    const errorLink = new ErrorLink(({error, result, operation, forward}) => {

        if (error instanceof CombinedGraphQLErrors) {
            for (const lError of error.errors as Error[]) {
                toastHandler(lError)
            }
        }

        if (error instanceof CombinedProtocolErrors) {
        }

        if (error instanceof ServerError) {
            const status = error.statusCode;
            if (status === 401) {
                localStorage.removeItem("ide_code-zero_session")
                router.push("/login")
            }
        }

        if (error instanceof ServerParseError) {
        }
    })

    const authMiddleware = setContext((_, {headers}) => {
        let token: string | undefined
        try {
            const raw = localStorage.getItem("ide_code-zero_session")
            token = raw ? JSON.parse(raw)?.token : undefined
        } catch {
        }

        return {
            headers: {
                ...headers,
                ...(token ? {authorization: `Session ${token}`} : {}),
            },
        }
    })


    const responseHandlerLink = new ApolloLink((operation, forward) => {
        if (!forward) {
            // sollte bei dir nicht passieren, aber TS glücklich machen
            return null as any
        }

        return new Observable((observer) => {
            const sub = forward(operation).subscribe({
                next: (result) => {

                    function findErrors(obj: any): Error[] {
                        if (obj === null || typeof obj !== "object") return []

                        // 1) Wenn das Objekt selbst "errors" hat
                        if ("errors" in obj && Array.isArray(obj.errors)) {
                            return obj.errors
                        }

                        // 2) Rekursiv alle Unterobjekte durchsuchen
                        for (const key of Object.keys(obj)) {
                            const value = obj[key]
                            if (value && typeof value === "object") {
                                const found = findErrors(value)
                                if (found) return found
                            }
                        }

                        return []
                    }

                    findErrors(result).map((error) => toastHandler(error))
                    observer.next(result);
                },
                complete: () => observer.complete()
            })

            // Cleanup
            return () => sub.unsubscribe()
        })
    })

    const client = React.useMemo(() => new ApolloClient({
        cache: new InMemoryCache(),
        link: ApolloLink.from([errorLink, authMiddleware, responseHandlerLink, new HttpLink({uri: "/graphql"})]),
        defaultOptions: {
            watchQuery: {
                errorPolicy: "all",
            },
            query: {
                errorPolicy: "all",
            },
            mutate: {
                errorPolicy: "all",
            },
        },
    }), [authMiddleware])

    return React.useMemo(() => {
        return <html>
        <body>
        <Toaster position={"bottom-center"}/>

        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
        </body>
        </html>
    }, [client, children])
}
