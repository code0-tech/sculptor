"use client";

import React from "react";
import {
    Alert,
    Button,
    EmailInput,
    emailValidation,
    PasswordInput,
    SegmentedControl,
    SegmentedControlItem,
    Spacing,
    Text,
    toast,
    useForm,
    useService
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {setUserSession} from "@edition/user/hooks/User.session.hook";
import {MfaInputComponent} from "@edition/user/components/MfaInputComponent";
import {MfaType} from "@code0-tech/sagittarius-graphql-types";
import {IdentityProviderButtonsComponent} from "@edition/user/components/IdentityProviderButtonsComponent";

export const UserLoginPage: React.FC = () => {

    const query = useSearchParams() //can be passwordReset
    const userService = useService(UserService)
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()

    const [_, setFailedAttempts] = React.useState(0)
    const [isInTimeout, setIsInTimeout] = React.useState(false)
    const [needsMfa, setNeedsMfa] = React.useState(false)
    const [mfaType, setMfaType] = React.useState<string>("TOTP")

    // Focus the relevant field: the MFA code input while stepping up, otherwise
    // the email input. autoFocus is unreliable here (React skips it on SSR
    // hydration), so we imperatively focus the first input in the active view.
    const focusContainerRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        const focusFirst = () => {
            const input = focusContainerRef.current?.querySelector<HTMLInputElement>(
                "input:not([type=hidden]):not([disabled])"
            )
            if (input && document.activeElement !== input) input.focus()
        }
        // Defer past Radix's roving-focus/collection setup (the OTP field
        // registers its inputs via layout effects and would otherwise steal
        // focus back), then retry once in case the first attempt is pre-empted.
        let retry = 0
        const raf = requestAnimationFrame(() => {
            focusFirst()
            retry = requestAnimationFrame(focusFirst)
        })
        return () => {
            cancelAnimationFrame(raf)
            cancelAnimationFrame(retry)
        }
    }, [needsMfa, mfaType])

    const initialValues = React.useMemo(
        () => ({email: null, password: null, mfa: null}),
        []
    )

    const [inputs, validate] = useForm<{
        email: null
        password: null
        mfa: string | null
    }>({
        useInitialValidation: false,
        initialValues,
        validate: {
            email: (value) => {
                if (!value) return "Email is required"
                if (!emailValidation(value)) return "Please provide a valid email"
                return null
            },
            password: (value) => {
                if (!value) return "Password is required"
                return null
            },
            mfa: (value) => {
                return needsMfa && !value ? "Enter your authentication code" : null
            }
        },
        onSubmit: (values) => {
            if (isInTimeout) {
                toast({
                    title: "Too many failed attempts. Please try again in 5 seconds.",
                    color: "error",
                    duration: 5000
                })
                return
            }
            startTransition(async () => {
                const payload = await userService.usersLogin({
                    email: values.email!,
                    password: values.password!,
                    ...(values.mfa ? {mfa: {type: mfaType as MfaType, value: values.mfa}} : {})
                })
                if (!values.mfa && (!!payload?.errors?.some(error => error?.errorCode === "MFA_REQUIRED" || error?.errorCode === "MFA_FAILED"))) {
                    setNeedsMfa(true)
                    return
                }
                if ((payload?.errors?.length ?? 0) > 0) {
                    if (needsMfa) {
                        toast({title: "That code isn't valid. Please try again.", color: "error"})
                        return
                    }
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
                    setUserSession(payload.userSession)
                    router.push("/")
                    router.refresh()
                    return
                }
                return
            })
        }
    })

    if (needsMfa) {
        return <div ref={focusContainerRef} style={{display: "contents"}}>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>
                Two-factor authentication
            </Text>
            <Spacing spacing={"md"}/>
            <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                Enter a code from your authenticator app or one of your backup codes to finish signing in.
            </Text>
            <Spacing spacing={"xl"}/>
            <SegmentedControl type={"single"}
                              value={mfaType}
                              tabIndex={-1}
                              onValueChange={(next) => {
                                  setMfaType(next)
                                  inputs.getInputProps("mfa").formValidation?.setValue?.(null)
                              }}>
                <SegmentedControlItem tabIndex={-1} w={"100%"} value={"TOTP"}>
                    <Text>Authenticator</Text>
                </SegmentedControlItem>
                <SegmentedControlItem tabIndex={-1} w={"100%"} value={"BACKUP_CODE"}>
                    <Text>Backup code</Text>
                </SegmentedControlItem>
            </SegmentedControl>
            <Spacing spacing={"xl"}/>
            <MfaInputComponent type={mfaType as MfaType}
                               disabled={loading}
                               onComplete={() => {
                                   validate()
                               }}
                               {...inputs.getInputProps("mfa")}/>
            <Spacing spacing={"md"}/>
            <Button disabled={loading} color={"success"} w={"100%"} onClick={() => validate()}>
                {loading ? "Verifying..." : "Verify & Login"}
            </Button>
            <Text display={"block"} hierarchy={"tertiary"} size={"md"} mt={1.3}
                  style={{cursor: "pointer"}}
                  onClick={() => {
                      setNeedsMfa(false)
                      setMfaType("TOTP")
                      inputs.getInputProps("mfa").formValidation?.setValue?.(null)
                  }}>
                Back to login
            </Text>
        </div>
    }

    return <div ref={focusContainerRef} style={{display: "contents"}}>
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
            <Spacing spacing={"xl"}/>
            <PasswordInput data-qa-selector={"auth-login-password"} placeholder={"Password"}
                           {...inputs.getInputProps("password")}/>
            <Spacing spacing={"xl"}/>
            <Button disabled={loading} type={"submit"} data-qa-selector={"auth-login-send"} color={"success"} w={"100%"}>
                {loading ? "Loading..." : "Login"}
            </Button>
        </form>
        <Spacing spacing={"xl"}/>
        <div style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
            <div style={{flex: 1, borderTop: "1px solid rgba(255,255,255, .1)"}}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                or continue with
            </Text>
            <div style={{flex: 1, borderTop: "1px solid rgba(255,255,255, .1)"}}/>
        </div>
        <Spacing spacing={"xl"}/>
        <IdentityProviderButtonsComponent intent={"login"}/>
        <Spacing spacing={"xl"}/>
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
    </div>

}
