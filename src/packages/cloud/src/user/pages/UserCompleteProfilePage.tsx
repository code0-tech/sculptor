"use client";

import React from "react";
import {
    Button,
    Flex,
    PasswordInput,
    passwordValidation,
    Spacing,
    Text,
    TextInput,
    useForm,
    useService
} from "@code0-tech/pictor";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {UserService} from "@cloud-internal/user/services/User.service";
import {setUserSession} from "@ce-internal/user/hooks/User.session.hook";

export const UserCompleteProfilePage: React.FC = () => {

    const query = useSearchParams()
    const userService = useService(UserService)
    const router = useRouter()
    const [loading, startTransition] = React.useTransition()

    const initialValues = React.useMemo(() => ({
        claimToken: query.get("claimToken"),
        username: null,
        firstname: null,
        lastname: null,
        password: null,
        repeatPassword: null,
    }), [query])

    const [inputs, validate] = useForm<{
        claimToken: string | null,
        username: string | null,
        firstname: string | null,
        lastname: string | null,
        password: string | null,
        repeatPassword: string | null,
    }>({
        useInitialValidation: false,
        initialValues,
        validate: {
            claimToken: (value) => {
                if (!value) return "Claim token is required"
                return null
            },
            username: (value) => {
                if (!value) return "Username is required"
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
            if (!values.claimToken || !values.username || !values.password || !values.repeatPassword) return
            startTransition(async () => {
                await userService.usersCompleteGuestProfile({
                    claimToken: values.claimToken as string,
                    username: values.username as string,
                    firstname: values.firstname,
                    lastname: values.lastname,
                    password: values.password as string,
                    passwordRepeat: values.repeatPassword as string,
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
        <Text mb={0.7} size={"lg"} hierarchy={"primary"} display={"block"}>
            Complete your profile
        </Text>
        <Text mb={1.3} size={"md"} hierarchy={"tertiary"} display={"block"}>
            Your account was created during checkout. Pick a username and a password to finish signing up.
        </Text>
        <TextInput data-qa-selector={"auth-complete-profile-claim-token"} placeholder={"Claim token"}
                   {...inputs.getInputProps("claimToken")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <Flex style={{gap: "1.3rem"}}>
            {/**@ts-ignore**/}
            <TextInput data-qa-selector={"auth-complete-profile-firstname"} wrapperComponent={{style: {flex: 1}}}
                       placeholder={"First name"}
                       w={"100%"} {...inputs.getInputProps("firstname")}/>
            {/**@ts-ignore**/}
            <TextInput data-qa-selector={"auth-complete-profile-lastname"} wrapperComponent={{style: {flex: 1}}}
                       placeholder={"Last name"}
                       w={"100%"} {...inputs.getInputProps("lastname")}/>
        </Flex>
        <div style={{marginBottom: "1.3rem"}}/>
        <TextInput data-qa-selector={"auth-complete-profile-username"} placeholder={"Username"}
                   {...inputs.getInputProps("username")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput data-qa-selector={"auth-complete-profile-password"} placeholder={"Password"}
                       onChange={() => validate("password")}
                       {...inputs.getInputProps("password")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <PasswordInput data-qa-selector={"auth-complete-profile-repeat-password"} placeholder={"Repeat password"}
                       onChange={() => validate("repeatPassword")}
                       {...inputs.getInputProps("repeatPassword")}/>
        <div style={{marginBottom: "1.3rem"}}/>
        <Button data-qa-selector={"auth-complete-profile-send"} color={"info"} w={"100%"} mb={1.3} onClick={validate}>
            Complete profile
        </Button>
        <Spacing spacing={"xs"}/>
        <Text display={"flex"} hierarchy={"tertiary"} size={"md"}>
            Already finished your setup
            <Link href={"/login"}>
                <Text ml={0.35} hierarchy={"primary"} display={"flex"} size={"md"}>
                    Log in
                </Text>
            </Link>
        </Text>
    </>
}
