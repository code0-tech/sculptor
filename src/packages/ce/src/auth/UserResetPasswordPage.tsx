"use client";

import React from "react";
import {Alert, Button, PasswordInput, Spacing, Text, TextInput, useForm, useService} from "@code0-tech/pictor";
import {UserService} from "@core/user/User.service";
import Link from "next/link";
import Image from "next/image";
import {useRouter, useSearchParams} from "next/navigation";

export const UserResetPasswordPage: React.FC = () => {

    const query = useSearchParams() //can be passwordReset
    const userService = useService(UserService)
    const [loading, startTransition] = React.useTransition()
    const router = useRouter()

    const [inputs, validate] = useForm({
        initialValues: {
            code: null,
            password: null,
            repeatPassword: null,
        },
        validate: {
            code: (value) => {
                if (!value) return "Code is required"
                return null
            },
            password: (value) => {
                if (!value) return "Password is required"
                return null
            },
            repeatPassword: (value) => {
                if (!value) return "Repeat password is required"
                return null
            }
        },
        onSubmit: (values) => {
            if (!values.code || !values.password || !values.repeatPassword) return
            startTransition(async () => {
                await userService.usersPasswordReset({
                    resetToken: (values.code as unknown as string),
                    newPassword: (values.password as unknown as string),
                    newPasswordConfirmation: (values.repeatPassword as unknown as string),
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        router.push("/login?passwordReset=true")
                    }
                })
            })
        }
    })

    return <>
        <Image src={"/CodeZero_App_Background_Colorful.png"} alt={"CodeZero Logo"}
               width={40}
               height={40}
               style={{marginBottom: "1.3rem"}}/>
        <Text mb={0.7} size={"lg"} hierarchy={"primary"} display={"block"}>
            Reset your password
        </Text>
        <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        {query.has("passwordReset") ? (
            <>
                <Alert color={"success"}>If your email address exists, you received an email with a token to reset your password.</Alert>
                <Spacing spacing={"xl"}/>
            </>
        ) : null}
        <TextInput placeholder={"Code"} {...inputs.getInputProps("code")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput placeholder={"Password"} {...inputs.getInputProps("password")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput placeholder={"Repeat password"} {...inputs.getInputProps("repeatPassword")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <Button color={"info"} w={"100%"} mb={1.3} onClick={validate}>
            Reset password
        </Button>
        <Text display={"block"} hierarchy={"tertiary"} size={"md"}>
            Don't have an account yet
            <Link href={"/login"}>
                <Text ml={0.35} hierarchy={"primary"} size={"md"}>
                    Log in
                </Text>
            </Link>
        </Text>
    </>
}