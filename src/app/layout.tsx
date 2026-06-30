"use client";

import {
    ApolloClient,
    ApolloLink,
    CombinedGraphQLErrors,
    HttpLink,
    InMemoryCache,
    Observable,
    ServerError,
    split,
} from "@apollo/client";
import {ApolloProvider} from "@apollo/client/react";
import React, {Suspense} from "react";
import "./global.scss"
import {setContext} from "@apollo/client/link/context";
import {ErrorLink} from "@apollo/client/link/error";
import {useRouter} from "next/navigation";
import {Toaster} from "sonner";
import {Error} from "@code0-tech/sagittarius-graphql-types";
import {Inter} from 'next/font/google'
import {GraphQLFormattedError} from "graphql/error";
import {addIslandErrorNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";
import {createConsumer} from "@rails/actioncable";
import ActionCableLink from "graphql-ruby-client/subscriptions/ActionCableLink";
import {AIGenerationWatcherComponent} from "@edition/ai/components/AIGenerationWatcherComponent";

/**
 * Load the Inter font with Latin subset and swap display strategy
 */
const inter = Inter({
    subsets: ['latin'],
    display: "swap",
})


/**
 * Mapping of error codes to their descriptions
 */
const ErrorCodeDescription: Record<string, string> = {
    CANNOT_DELETE_LAST_ADMIN_ROLE: "Cannot delete role",
    CANNOT_MODIFY_ADMIN: "Cannot modify admin",
    CANNOT_MODIFY_OWN_ADMIN: "Cannot modify self",
    CANNOT_REMOVE_LAST_ADMINISTRATOR: "Cannot remove admin",
    CANNOT_REMOVE_LAST_ADMIN_ABILITY: "Cannot remove ability",
    CYCLIC_DATA_TYPE_REFERENCE: "Dependency cycle detected",
    DATA_TYPE_NOT_FOUND: "Data type missing",
    EMAIL_VERIFICATION_SEND_FAILED: "Email send failed",
    EXTERNAL_IDENTITY_DOES_NOT_EXIST: "External identity missing",
    FAILED_TO_INVALIDATE_OLD_BACKUP_CODES: "Invalidation failed",
    FAILED_TO_RESET_PASSWORD: "Password reset failed",
    FAILED_TO_SAVE_VALID_BACKUP_CODE: "Save codes failed",
    FLOW_GENERATION_FAILED: "Flow generation failed",
    FLOW_NOT_FOUND: "Flow not found",
    FLOW_TYPE_NOT_FOUND: "Flow type missing",
    GENERIC_KEY_NOT_FOUND: "Key not found",
    IDENTITY_NOT_FOUND: "Identity not found",
    IDENTITY_VALIDATION_FAILED: "Identity validation failed",
    INCONSISTENT_NAMESPACE: "Inconsistent namespace",
    INVALID_ATTACHMENT: "Invalid attachment",
    INVALID_DATA_TYPE: "Invalid data type",
    INVALID_DATA_TYPE_LINK: "Invalid type link",
    INVALID_EXECUTION_RESULT: "Invalid execution result",
    INVALID_EXTERNAL_IDENTITY: "Invalid external identity",
    INVALID_FLOW: "Invalid flow",
    INVALID_FLOW_SETTING: "Invalid flow setting",
    INVALID_FLOW_TYPE: "Invalid flow type",
    INVALID_FUNCTION_DEFINITION: "Invalid function definition",
    INVALID_FUNCTION_ID: "Invalid function ID",
    INVALID_LICENSE: "Invalid license",
    INVALID_LOGIN_DATA: "Invalid login data",
    INVALID_MODULE_CONFIGURATION: "Invalid module config",
    INVALID_MODULE_CONFIGURATION_DEFINITION: "Invalid config definition",
    INVALID_NAMESPACE_MEMBER: "Invalid namespace member",
    INVALID_NAMESPACE_PROJECT: "Invalid namespace project",
    INVALID_NAMESPACE_ROLE: "Invalid namespace role",
    INVALID_NODE_FUNCTION: "Invalid node function",
    INVALID_NODE_PARAMETER: "Invalid node parameter",
    INVALID_ORGANIZATION: "Invalid organization",
    INVALID_PARAMETER_DEFINITION: "Invalid parameter definition",
    INVALID_PARAMETER_INDEX: "Invalid parameter index",
    INVALID_PASSWORD_REPEAT: "Password mismatch",
    INVALID_REFERENCE_VALUE: "Invalid reference value",
    INVALID_RUNTIME: "Invalid runtime",
    INVALID_RUNTIME_FUNCTION_DEFINITION: "Invalid runtime function",
    INVALID_RUNTIME_MODULE: "Invalid runtime module",
    INVALID_RUNTIME_MODULE_DEFINITION: "Invalid module definition",
    INVALID_RUNTIME_MODULE_STATUS: "Invalid module status",
    INVALID_RUNTIME_PARAMETER_DEFINITION: "Invalid parameter definition",
    INVALID_RUNTIME_STATUS: "Invalid runtime status",
    INVALID_RUNTIME_STATUS_CONFIGURATION: "Invalid status config",
    INVALID_SETTING: "Invalid setting",
    INVALID_TOTP_SECRET: "Invalid TOTP secret",
    INVALID_USER: "Invalid user",
    INVALID_USER_IDENTITY: "Invalid user identity",
    INVALID_USER_SESSION: "Invalid user session",
    INVALID_VERIFICATION_CODE: "Invalid verification code",
    IS_PRIMARY_RUNTIME: "Is primary runtime",
    LICENSE_NOT_FOUND: "License not found",
    LOADING_IDENTITY_FAILED: "Identity load failed",
    LOCK_TIMEOUT: "Lock timeout",
    MFA_FAILED: "MFA failed",
    MFA_REQUIRED: "MFA required",
    MISSING_DEFINITION: "Missing definition",
    MISSING_IDENTITY_DATA: "Missing identity data",
    MISSING_PARAMETER: "Missing parameter",
    MISSING_PERMISSION: "Missing permission",
    MISSING_PRIMARY_RUNTIME: "Missing primary runtime",
    NAMESPACE_MEMBER_NOT_FOUND: "Namespace member missing",
    NAMESPACE_NOT_FOUND: "Namespace not found",
    NAMESPACE_PROJECT_NOT_FOUND: "Namespace project missing",
    NAMESPACE_ROLE_NOT_FOUND: "Namespace role missing",
    NODE_NOT_FOUND: "Node not found",
    NO_DATA_TYPE_FOR_IDENTIFIER: "No data type",
    NO_FREE_LICENSE_SEATS: "No license seats",
    NO_PRIMARY_RUNTIME: "No primary runtime",
    ORGANIZATION_NOT_FOUND: "Organization not found",
    OUTDATED_DEFINITION: "Outdated definition",
    PRIMARY_LEVEL_NOT_FOUND: "Primary level missing",
    PROJECT_NOT_FOUND: "Project not found",
    REFERENCED_VALUE_NOT_FOUND: "Referenced value missing",
    REGISTRATION_DISABLED: "Registration disabled",
    RUNTIME_MISMATCH: "Runtime mismatch",
    RUNTIME_MODULE_NOT_FOUND: "Runtime module missing",
    RUNTIME_NOT_ASSIGNED: "Runtime not assigned",
    RUNTIME_NOT_COMPATIBLE: "Runtime not compatible",
    RUNTIME_NOT_FOUND: "Runtime not found",
    SECONDARY_LEVEL_NOT_FOUND: "Secondary level missing",
    TERTIARY_LEVEL_EXCEEDS_PARAMETERS: "Tertiary level exceeded",
    TOTP_SECRET_ALREADY_SET: "TOTP already set",
    UNMODIFIABLE_FIELD: "Unmodifiable field",
    UNSUPPORTED_AUTHENTICATION: "Unsupported authentication",
    USER_NOT_FOUND: "User not found",
    USER_SESSION_NOT_FOUND: "Session not found",
    WRONG_TOTP: "Wrong TOTP code",
}

/**
 * Handles error toasts based on error type
 */
const toastHandler = (error: Error | GraphQLFormattedError) => {
    console.error("[ERROR]", error)
    if (error && "errorCode" in error) {
        addIslandErrorNotification({
            message: ErrorCodeDescription[(error.errorCode as string)] ?? "Internal error"
        })
    } else {
        addIslandErrorNotification({
            message: "Internal error"
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
        if (error instanceof CombinedGraphQLErrors) {
            error.errors.forEach((error: GraphQLFormattedError) => {
                toastHandler(error)
            })
            return
        }

        if (error instanceof ServerError) {
            const status = error.statusCode;
            if (status === 401) {
                localStorage.removeItem("ide_code-zero_session")
                router.push("/login")
                return
            }
        }

        toastHandler(error)
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

                    findErrors(result)?.map((error) => toastHandler(error))
                    observer.next(result);
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete()
            })
            return () => sub.unsubscribe()
        })
    })

    /**
     * Apollo Client instance with configured links and cache
     */
    const client = React.useMemo(() => {
        const cable = createConsumer("/cable")

        const getToken = () => {
            try {
                const raw = localStorage.getItem("ide_code-zero_session")
                return raw ? JSON.parse(raw)?.token : undefined
            } catch {
                return undefined
            }
        }

        const hasSubscriptionOperation = ({query: {definitions}}: any) => {
            return definitions.some(
                ({kind, operation}: any) => kind === "OperationDefinition" && operation === "subscription"
            )
        }

        const actionCableLink = new ActionCableLink({
            cable,
            connectionParams: () => {
                const token = getToken()
                return token ? {token: `Session ${token}`} : {}
            },
        })

        const link = ApolloLink.split(
            hasSubscriptionOperation,
            actionCableLink,
            ApolloLink.from([errorLink, authMiddleware, responseHandlerLink, new HttpLink({uri: "/graphql"})]),
        )

        return new ApolloClient({
            cache: new InMemoryCache(),
            link,
            defaultOptions: {
                watchQuery: {errorPolicy: "all"},
                query: {errorPolicy: "all"},
                mutate: {errorPolicy: "all"},
            },
        })
    }, [authMiddleware])

    return React.useMemo(() => {
        return <html suppressHydrationWarning>
        <body className={inter.className}>
        <Suspense fallback={"loading..."}>
            <ApolloProvider client={client}>
                <Toaster position={"top-right"}/>
                <AIGenerationWatcherComponent/>
                {children}
            </ApolloProvider>
        </Suspense>
        </body>
        </html>
    }, [client, children])
}
