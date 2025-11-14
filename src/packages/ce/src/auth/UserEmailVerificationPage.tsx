"use client";

import React from "react";
import {Button, setUserSession, Text, TextInput, useForm, useService} from "@code0-tech/pictor";
import {UserService} from "@edition/user/User.service";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";

export const UserEmailVerificationPage: React.FC = () => {

    const userService = useService(UserService)
    const [loading, startTransition] = React.useTransition()
    const router = useRouter()

    const [inputs, validate] = useForm({
        initialValues: {
            code: null,
        },
        validate: {
            code: (value) => {
                if (!value) return "Code is required"
                return null
            }
        },
        onSubmit: (values) => {
            if (!values.code) return
            startTransition(async () => {
                await userService.usersEmailVerification({
                    token: (values.code as unknown as string),
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        router.push("/?emailVerified=true")
                        router.refresh()
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
            Verify your email address
        </Text>
        <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        <TextInput placeholder={"Code"} {...inputs.getInputProps("code")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <Button color={"info"} w={"100%"} mb={1.3} onClick={validate}>
            Verify
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