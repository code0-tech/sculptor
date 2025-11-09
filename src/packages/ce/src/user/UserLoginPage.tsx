"use client";

import React from "react";
import {Button, Col, Container, Flex, PasswordInput, Text, TextInput, useForm, useService} from "@code0-tech/pictor";
import {UserService} from "@core/user/User.service";
import Image from "next/image";
import Link from "next/link";

export const UserLoginPage: React.FC = () => {

    const userService = useService(UserService)
    const [inputs, validate] = useForm({
        initialValues: {
            emailOrUsername: null,
            password: null
        },
        validate: {
            emailOrUsername: (value) => {
                if (!value) return "Email is required"
                return null
            },
            password: (value) => {
                if (!value) return "Password is required"
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
                    Login to CodeZero
                </Text>
                <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
                    Build high-class workflows, endpoints and software without coding
                </Text>
                <TextInput placeholder={"Email or username"} {...inputs.getInputProps("emailOrUsername")}/>
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
            </Col>
        </Flex>
    </Container>

}