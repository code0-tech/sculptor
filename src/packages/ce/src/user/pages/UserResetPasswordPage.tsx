"use client";

import React from "react";
import {
    Alert,
    Button,
    PasswordInput,
    passwordValidation,
    Spacing,
    Text,
    TextInput,
    useForm,
    useService
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";

export const UserResetPasswordPage: React.FC = () => {

    const query = useSearchParams() //can be passwordReset or code
    const userService = useService(UserService)
    const [loading, startTransition] = React.useTransition()
    const router = useRouter()

    const initialValues = React.useMemo(() => ({
        code: query.get("code"),
        password: null,
        repeatPassword: null,
    }), [query])

    const [inputs, validate] = useForm<{
        code: string | null,
        password: string | null,
        repeatPassword: string | null,
    }>({
        useInitialValidation: false,
        initialValues,
        validate: {
            code: (value) => {
                if (!value) return "Code is required"
                return null
            },
            password: passwordValidation,
            repeatPassword: (value, values) => {
                if (passwordValidation(value) != null) return passwordValidation(value)
                if (value != values?.password) return "Passwords do not match"
                return null
            }
        },
        onSubmit: (values) => {
            const {code, password, repeatPassword} = values
            if (!code || !password || !repeatPassword) return
            startTransition(async () => {
                await userService.usersPasswordReset({
                    resetToken: code,
                    newPassword: password,
                    newPasswordConfirmation: repeatPassword,
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        router.push("/login?passwordReset=true")
                    }
                })
            })
        }
    })

    return <>
        <Text mb={0.7} size={"lg"} hierarchy={"primary"} display={"block"}>
            Reset your password
        </Text>
        <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        {query.has("passwordReset") ? (
            <>
                <Alert color={"success"}>If your email address exists, you received an email with a token to reset your
                    password.</Alert>
                <Spacing spacing={"xl"}/>
            </>
        ) : null}
        <TextInput data-qa-selector={"auth-password-reset-code"} placeholder={"Code"} {...inputs.getInputProps("code")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput data-qa-selector={"auth-password-reset-password"} placeholder={"Password"}
                       onChange={() => validate("password")}
                       {...inputs.getInputProps("password")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput data-qa-selector={"auth-password-reset-repeat-password"} placeholder={"Repeat password"}
                       onChange={() => validate("repeatPassword")}
                       {...inputs.getInputProps("repeatPassword")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <Button data-qa-selector={"auth-password-reset-send"} color={"info"} w={"100%"} mb={1.3} onClick={validate}>
            Reset password
        </Button>
        <Text display={"flex"} hierarchy={"tertiary"} size={"md"}>
            Don't have an account yet
            <Link href={"/login"}>
                <Text ml={0.35} hierarchy={"primary"} display={"flex"} size={"md"}>
                    Log in
                </Text>
            </Link>
        </Text>
    </>
}