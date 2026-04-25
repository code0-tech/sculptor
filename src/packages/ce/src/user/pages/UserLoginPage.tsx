"use client";

import React from "react";
import {
    Alert,
    Button,
    EmailInput,
    emailValidation,
    PasswordInput,
    Spacing,
    Text, toast,
    useForm,
    useService
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {setUserSession, useUserSession} from "@edition/user/hooks/User.session.hook";
import {isValidRedirect} from "@core/util/redirect";

export const UserLoginPage: React.FC = () => {

    const query = useSearchParams() //can be passwordReset
    const userService = useService(UserService)
    const userSession = useUserSession()
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()

    const callbackUrl = query.get("callbackUrl")

    const [failedAttempts, setFailedAttempts] = React.useState(0)
    const [isInTimeout, setIsInTimeout] = React.useState(false)

    const onSubmit = React.useCallback((values: any) => {
        if (!values.password || !values.email || !emailValidation(values.email)) return
        if (isInTimeout) {
            toast({
                dismissible: false,
                title: "Too many failed attempts. Please try again in 5 seconds.",
                color: "error",
                duration: 5000,
            })
            return
        }
        startTransition(async () => {
            await userService.usersLogin({
                password: (values.password as unknown as string),
                email: (values.email as unknown as string),
            }).then(payload => {
                if ((payload?.errors?.length ?? 0) > 0) {
                    setFailedAttempts(prevState => {
                        const newState = prevState + 1
                        if (newState % 3 === 0 || newState > 3) {
                            setIsInTimeout(true)
                            setTimeout(() => setIsInTimeout(false), 5000)
                        }
                        return newState
                    })
                    return
                }
                if (payload?.userSession) {
                    const token = payload.userSession.token
                    setUserSession(payload.userSession)
                    if (callbackUrl && isValidRedirect(callbackUrl)) {
                        const targetURL = new URL(callbackUrl)
                        targetURL.searchParams.set('token', token ?? "")
                        router.push(targetURL.toString())
                        return
                    }
                    router.push("/")
                    router.refresh()
                }
            })
        })
    }, [isInTimeout])

    const initialValues = React.useMemo(() => ({
        email: null,
        password: null
    }), [])

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {
            email: (value) => {
                if (!value) return "Email is required"
                if (!emailValidation(value)) return "Please provide a valid email"
                return null
            },
            password: (value) => {
                if (!value) return "Password is required"
                return null
            }
        },
        onSubmit: onSubmit
    })

    React.useEffect(() => {
        if (userSession?.active && userSession.token) {
            if (callbackUrl && isValidRedirect(callbackUrl)) {
                const targetURL = new URL(callbackUrl)
                targetURL.searchParams.set('token', userSession.token ?? "")
                router.push(targetURL.toString())
                return
            }
        }
    }, [userSession])


    return <>
        <form noValidate onSubmit={(e) => {
            validate()
            e.stopPropagation()
            e.preventDefault()
            return false
        }}>
            <Text mb={0.7} size={"lg"} hierarchy={"primary"} display={"block"}>
                Login to CodeZero
            </Text>
            <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
                Build high-class workflows, endpoints and software without coding
            </Text>
            {query.has("passwordReset") ? (
                <>
                    <Alert color={"success"}>Your password was successfully reset.</Alert>
                    <Spacing spacing={"xl"}/>
                </>
            ) : null}
            <EmailInput data-qa-selector={"auth-login-email"} placeholder={"Email"} {...inputs.getInputProps("email")}/>
            <div style={{marginBottom: "1.3rem"}}/>
            <PasswordInput data-qa-selector={"auth-login-password"} placeholder={"Password"}
                           {...inputs.getInputProps("password")}/>
            <div style={{marginBottom: "1.3rem"}}/>
            <Button disabled={loading} type={"submit"} data-qa-selector={"auth-login-send"} color={"success"} w={"100%"} mb={1.3}>
                {loading ? "Loading..." : "Login"}
            </Button>
        </form>
        <Link href={`/password?${query.toString()}`}>
            <Text display={"block"} hierarchy={"tertiary"} size={"md"} mb={0.7}>
                Forgot password?
            </Text>
        </Link>
        <Text display={"flex"} hierarchy={"tertiary"} size={"md"}>
            Don't have an account yet
            <Link href={`/register?${query.toString()}`}>
                <Text ml={0.35} hierarchy={"primary"} display={"flex"} size={"md"}>
                    Sign up
                </Text>
            </Link>
        </Text>
    </>

}