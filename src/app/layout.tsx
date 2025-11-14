"use client";

import {
    ApolloClient,
    ApolloLink,
    CombinedGraphQLErrors,
    HttpLink,
    InMemoryCache,
    Observable,
    ServerError,
    ServerParseError
} from "@apollo/client";
import {ApolloProvider} from "@apollo/client/react";
import React, {Suspense} from "react";
import "./global.scss"
import {setContext} from "@apollo/client/link/context";
import {ErrorLink} from "@apollo/client/link/error";
import {useRouter} from "next/navigation";
import {Toaster} from "sonner";
import {Error} from "@code0-tech/sagittarius-graphql-types";
import {toast} from "@code0-tech/pictor";
import {Inter} from 'next/font/google'

/**
 * Load the Inter font with Latin subset and swap display strategy
 */
const inter = Inter({
    subsets: ['latin'],
    display: "swap",
})

/**
 * Override console error and warn in development to log to console.log
 */
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);

    console.error = (...args: unknown[]) => {
        console.log(args)
    }
}

/**
 * Mapping of error codes to their descriptions
 */
const ErrorCodeDescription: Record<string, string> = {
    CANNOT_DELETE_LAST_ADMIN_ROLE: "Cannot delete the last administrative role",
    CANNOT_REMOVE_LAST_ADMINISTRATOR: "Cannot remove the last administrator",
    CANNOT_REMOVE_LAST_ADMIN_ABILITY: "Cannot remove the last administrative ability",
    EXTERNAL_IDENTITY_DOES_NOT_EXIST: "The external identity does not exist",
    FAILED_TO_INVALIDATE_OLD_BACKUP_CODES: "Failed to invalidate old backup codes",
    FAILED_TO_SAVE_VALID_BACKUP_CODE: "Failed to save the new backup code",
    GENERIC_KEY_NOT_FOUND: "The specified key does not exist in the data type",
    IDENTITY_VALIDATION_FAILED: "External identity validation failed",
    INCONSISTENT_NAMESPACE: "The resources belong to different namespaces",
    INVALID_EXTERNAL_IDENTITY: "The external identity is invalid",
    INVALID_LOGIN_DATA: "The provided login data is invalid",
    INVALID_SETTING: "The provided setting is invalid",
    INVALID_VERIFICATION_CODE: "The verification code is invalid",
    MFA_FAILED: "The provided MFA data is invalid",
    MFA_REQUIRED: "Multi-factor authentication is required",
    MISSING_IDENTITY_DATA: "Required data for the external identity is missing",
    MISSING_PARAMETER: "One or more required parameters are missing",
    MISSING_PERMISSION: "You do not have permission to perform this action",
    NO_FREE_LICENSE_SEATS: "There are no free license seats available",
    NO_PRIMARY_RUNTIME: "No primary runtime is configured for this project",
    PRIMARY_LEVEL_NOT_FOUND: "The primary level could not be found",
    REGISTRATION_DISABLED: "Self-registration is currently disabled",
    RUNTIME_MISMATCH: "The resources belong to different runtimes",
    SECONDARY_LEVEL_NOT_FOUND: "The secondary level could not be found",
    TERTIARY_LEVEL_EXCEEDS_PARAMETERS: "The tertiary level exceeds allowed parameters",
    TOTP_SECRET_ALREADY_SET: "TOTP is already configured for this user",
    UNMODIFIABLE_FIELD: "This field cannot be modified",
    WRONG_TOTP: "The provided TOTP code is incorrect",
}

/**
 * Handles error toasts based on error type
 */
const toastHandler = (error: Error) => {
    if (error.__typename === "ErrorCode") {
        toast({
            title: ErrorCodeDescription[(error.errorCode as string)],
            color: "error",
            dismissible: true,
        })
    } else {
        toast({
            title: "An internal error occurred",
            color: "error",
            dismissible: true,
        })
    }
}

/**
 * Root layout component that sets up Apollo Client and error handling
 */
export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {

    const router = useRouter()

    /**
     * Apollo Error Link to handle GraphQL and network errors
     */
    const errorLink = new ErrorLink(({error, result, operation, forward}) => {

        if (error instanceof CombinedGraphQLErrors) error.errors.forEach((error: Error) => {
            toastHandler(error)
        })

        if (error instanceof ServerError) {
            const status = error.statusCode;
            if (status === 401) {
                localStorage.removeItem("ide_code-zero_session")
                router.push("/login")
            }
        }

        if (error instanceof ServerParseError) {
            toastHandler(error)
        }
    })

    /**
     * Apollo Auth Middleware to attach session token to headers
     */
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


    /**
     * Apollo Response Handler Link to process errors in responses
     */
    const responseHandlerLink = new ApolloLink((operation, forward) => {
        if (!forward) return null as any
        return new Observable((observer) => {
            const sub = forward(operation).subscribe({
                next: (result) => {

                    function findErrors(obj: any): Error[] {
                        if (obj === null || typeof obj !== "object") return []

                        if ("errors" in obj && Array.isArray(obj.errors)) {
                            return obj.errors
                        }

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
            return () => sub.unsubscribe()
        })
    })

    /**
     * Apollo Client instance with configured links and cache
     */
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
        <body className={inter.className}>
        <Suspense fallback={"loading..."}>
            <ApolloProvider client={client}>
                <Toaster position={"top-right"}/>
                {children}
            </ApolloProvider>
        </Suspense>
        </body>
        </html>
    }, [client, children])
}
