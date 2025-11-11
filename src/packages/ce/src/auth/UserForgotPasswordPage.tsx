"use client";

import React from "react";
import {Button, EmailInput, emailValidation, Text, useForm, useService} from "@code0-tech/pictor";
import {UserService} from "@core/user/User.service";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";

export const UserForgotPasswordPage: React.FC = () => {

    const userService = useService(UserService)
    const [loading, startTransition] = React.useTransition()
    const router = useRouter()

    const [inputs, validate] = useForm({
        initialValues: {
            email: null,
        },
        validate: {
            email: (value) => {
                if (!value) return "Email is required"
                if (!emailValidation(value)) return "Please provide a valid email"
                return null
            }
        },
        onSubmit: (values) => {
            if (!values.email) return
            startTransition(async () => {
                await userService.usersPasswordResetRequest({
                    email: (values.email as unknown as string),
                }).then(payload => {
                    if (!payload?.errors) {
                        router.push("/password/reset?passwordReset=true")
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
            Forgot your password?
        </Text>
        <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        <EmailInput placeholder={"Email"} {...inputs.getInputProps("email")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <Button color={"info"} w={"100%"} mb={1.3} onClick={validate}>
            Send reset token
        </Button>
        <Text display={"block"} hierarchy={"tertiary"} size={"md"}>
            Didn't forget your password?
            <Link href={"/login"}>
                <Text ml={0.35} hierarchy={"primary"} size={"md"}>
                    Log in
                </Text>
            </Link>
        </Text>
    </>
}