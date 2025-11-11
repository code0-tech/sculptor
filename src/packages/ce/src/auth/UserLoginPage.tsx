"use client";

import React from "react";
import {
    Button,
    EmailInput,
    emailValidation,
    PasswordInput,
    setUserSession,
    Text,
    useForm,
    useService
} from "@code0-tech/pictor";
import {UserService} from "@core/user/User.service";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";

export const UserLoginPage: React.FC = () => {

    const userService = useService(UserService)
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()

    const [inputs, validate] = useForm({
        initialValues: {
            email: null,
            password: null
        },
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
        onSubmit: (values) => {
            if (!values.password || !values.email) return
            startTransition(async () => {
                await userService.usersLogin({
                    password: (values.password as unknown as string),
                    email: (values.email as unknown as string),
                }).then(payload => {
                    if (payload?.userSession) {
                        setUserSession(payload.userSession)
                        router.push("/")
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
            Login to CodeZero
        </Text>
        <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        <EmailInput placeholder={"Email"} {...inputs.getInputProps("email")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput placeholder={"Password"} {...inputs.getInputProps("password")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <Button color={"info"} w={"100%"} mb={1.3} onClick={validate}>
            Login
        </Button>
        <Link href={"/password"}>
            <Text display={"block"} hierarchy={"tertiary"} size={"md"} mb={0.7}>
                Forgot password?
            </Text>
        </Link>
        <Text display={"block"} hierarchy={"tertiary"} size={"md"}>
            Don't have an account yet
            <Link href={"/register"}>
                <Text ml={0.35} hierarchy={"primary"} size={"md"}>
                    Sign up
                </Text>
            </Link>
        </Text>
    </>

}