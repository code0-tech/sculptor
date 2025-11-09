"use client";

import React from "react";
import {Button, EmailInput, Flex, PasswordInput, Text, TextInput, useForm, useService} from "@code0-tech/pictor";
import Image from "next/image";
import Link from "next/link";
import {UserService} from "@core/user/User.service";

export const UserRegistrationPage: React.FC = () => {

    const userService = useService(UserService)

    const [inputs, validate] = useForm({
        initialValues: {
            email: null,
            username: null,
            password: null,
            repeatPassword: null,
        },
        validate: {
            email: (value) => {
                if (!value) return "Email is required"
                return null
            },
            username: (value) => {
                if (!value) return "Username is required"
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
            console.log(values)
        }
    })

    return <>
        <Image src={"/CodeZero_App_Background_Colorful.png"} alt={"CodeZero Logo"}
               width={40}
               height={40}
               style={{marginBottom: "1.3rem"}}/>
        <Text mb={0.7} size={"lg"} hierarchy={"primary"} display={"block"}>
            Sign up to CodeZero
        </Text>
        <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
            Build high-class workflows, endpoints and software without coding
        </Text>
        <Flex style={{gap: "1.3rem"}}>
            <EmailInput wrapperComponent={{style: {flex: 1}}} placeholder={"Email"} {...inputs.getInputProps("email")}/>
            <TextInput wrapperComponent={{style: {flex: 1}}} placeholder={"Username"}
                       w={"100%"} {...inputs.getInputProps("username")}/>
        </Flex>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput placeholder={"Password"} {...inputs.getInputProps("password")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput placeholder={"Repeat password"} {...inputs.getInputProps("repeatPassword")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <Button color={"info"} w={"100%"} mb={1.3} onClick={validate}>
            Sign up
        </Button>
        <Text display={"block"} hierarchy={"tertiary"} size={"md"}>
            Have an account
            <Link href={"/login"}>
                <Text ml={0.35} hierarchy={"primary"} size={"md"}>
                    Log in
                </Text>
            </Link>
        </Text>
    </>
}