"use client";

import React from "react";
import {Button, Col, Container, Flex, PasswordInput, Text, TextInput, useForm, useService} from "@code0-tech/pictor";
import {UserService} from "@core/user/User.service";
import Link from "next/link";
import Image from "next/image";

export const UserResetPasswordPage: React.FC = () => {
    const userService = useService(UserService)

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
            console.log(values)
        }
    })

    return <Container h={"100%"} w={"100%"}>
        <Flex h={"100%"} w={"100%"} align={"center"} justify={"center"}>
            <Col xs={4}>
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
            </Col>
        </Flex>
    </Container>
}