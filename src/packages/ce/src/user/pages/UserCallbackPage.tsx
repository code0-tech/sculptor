"use client";

import React from "react";
import {Alert, Button, Flex, Spacing, Text, useService} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {useRouter, useSearchParams} from "next/navigation";
import {IconLoader2} from "@tabler/icons-react";
import {motion} from "framer-motion";
import {setUserSession} from "@edition/user/hooks/User.session.hook";

export const UserCallbackPage: React.FC = () => {

    type IdentityAuthState = {
        intent: "login" | "register" | "link"
        providerId: string
        returnTo?: string
    }

    const userService = useService(UserService)
    const params = useSearchParams()
    const router = useRouter()
    const [error, setError] = React.useState<string | null>(null)
    const handled = React.useRef(false)

    const state = React.useMemo<IdentityAuthState | null>(() => {
        const raw = params.get("state")
        if (!raw) return null
        try {
            const json = JSON.parse(atob(raw.replace(/-/g, "+").replace(/_/g, "/")))
            const intent = json?.intent
            if ((intent !== "login" && intent !== "register" && intent !== "link")
                || typeof json?.providerId !== "string" || !json.providerId) return null
            return {
                intent,
                providerId: json.providerId,
                returnTo: typeof json.returnTo === "string" ? json.returnTo : undefined,
            }
        } catch {
            return null
        }
    }, [params])

    React.useEffect(() => {
        if (handled.current) return
        handled.current = true

        const providerError = params.get("error_description") || params.get("error")
        const code = params.get("code")

        if (providerError) {
            setError(providerError)
            return
        }
        if (!code || !state) {
            setError("This sign-in link is invalid or has expired. Please try again.")
            return
        }

        const args = {providerId: state.providerId, args: {code}}

        if (state.intent === "link") {
            userService.usersIdentityLink(args).then(payload => {
                if ((payload?.errors?.length ?? 0) > 0) {
                    setError("We couldn't link this provider to your account. Please try again.")
                    return
                }
                router.push("/")
                router.refresh()
            })
            return
        }

        const authenticate = state.intent === "register"
            ? userService.usersIdentityRegister(args)
            : userService.usersIdentityLogin(args)

        authenticate.then(payload => {
            if ((payload?.errors?.length ?? 0) > 0) {
                setError(state.intent === "register"
                    ? "We couldn't create your account with this provider. Please try again."
                    : "We couldn't sign you in with this provider. Please try again.")
                return
            }
            if (!payload?.userSession) {
                setError("We couldn't complete the sign-in. Please try again.")
                return
            }
            setUserSession(payload.userSession)
            router.push("/")
            router.refresh()
        })
    }, [])

    if (error) {
        const failure = state?.intent === "link"
            ? {title: "Linking failed", cta: "Back to overview", target: "/"}
            : state?.intent === "register"
                ? {title: "Registration failed", cta: "Back to registration", target: "/register"}
                : {title: "Sign-in failed", cta: "Back to login", target: "/login"}
        return <>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>
                {failure.title}
            </Text>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                Build high-class workflows, endpoints and software without coding
            </Text>
            <Spacing spacing={"xl"}/>
            <Alert color={"error"}>{error}</Alert>
            <Spacing spacing={"xl"}/>
            <Button color={"success"} w={"100%"}
                    onClick={() => router.push(failure.target)}>
                {failure.cta}
            </Button>
        </>
    }

    return <Flex align={"center"} justify={"center"} style={{flexDirection: "column", gap: "1rem"}}>
        <motion.div style={{display: "flex"}}
                    animate={{rotate: 360}}
                    transition={{duration: 1, ease: "linear", repeat: Infinity}}>
            <IconLoader2 size={20}/>
        </motion.div>
        <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
            Completing your sign-in&hellip;
        </Text>
    </Flex>
}
