"use client"

import React from "react";
import {
    Button,
    Col,
    EmailInput,
    emailValidation,
    Flex,
    PasswordInput,
    passwordValidation,
    Spacing,
    SwitchInput,
    Text,
    TextInput,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import Link from "next/link";
import {useRouter, notFound} from "next/navigation";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {addIslandSuccessNotification, addIslandErrorNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";
import {IconAt, IconLock, IconMail, IconUser} from "@tabler/icons-react";

export const UserInvitePage: React.FC = () => {

    const currentSession = useUserSession()
    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const currentUser = React.useMemo(() => userService.getById(currentSession?.user?.id), [userStore, currentSession])
    const router = useRouter()
    const [, startTransition] = React.useTransition()

    const [inputs, validate] = useForm<{
        email: string | null,
        username: string | null,
        firstname: string | null,
        lastname: string | null,
        password: string | null,
        repeatPassword: string | null,
        admin: boolean | null,
    }>({
        useInitialValidation: false,
        initialValues: {
            email: null,
            username: null,
            firstname: null,
            lastname: null,
            password: null,
            repeatPassword: null,
            admin: false,
        },
        validate: {
            email: (value) => {
                if (!value) return "Email is required"
                if (!emailValidation(value)) return "Please provide a valid email"
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
            if (!values.email || !values.username || !values.password || !values.repeatPassword) return
            startTransition(async () => {
                await userService.usersCreate({
                    email: values.email!!,
                    username: values.username!!,
                    firstname: values.firstname,
                    lastname: values.lastname,
                    password: values.password!!,
                    passwordRepeat: values.repeatPassword!!,
                    admin: values.admin,
                }).then(payload => {
                    if (payload?.user) {
                        router.push("/users")
                        addIslandSuccessNotification({
                            message: "Invited user",
                        })
                    }
                })
            })
        }
    })

    if (currentUser && !currentUser.admin) {
        notFound()
    }

    return <div style={{
        background: "#070514",
        height: "100%",
        padding: "2rem",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem"
    }}>
        <Flex mih={"100%"} miw={"100%"} align={"center"} justify={"center"}>
            <Col xs={4}>
                <Text size={"xl"} hierarchy={"primary"} display={"block"}>
                    Invite a new user
                </Text>
                <Spacing spacing={"xs"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    Create a new user with access to your instance. They can log in with the credentials you provide.
                </Text>
                <Spacing spacing={"xl"}/>
                <Flex style={{gap: "1.3rem"}}>
                    {/*@ts-ignore*/}
                    <TextInput wrapperComponent={{style: {flex: 1}}} placeholder={"Firstname"} w={"100%"}
                               left={<IconUser size={16}/>} leftType={"icon"}
                               {...inputs.getInputProps("firstname")}/>
                    {/*@ts-ignore*/}
                    <TextInput wrapperComponent={{style: {flex: 1}}} placeholder={"Lastname"} w={"100%"}
                               left={<IconUser size={16}/>} leftType={"icon"}
                               {...inputs.getInputProps("lastname")}/>
                </Flex>
                <Spacing spacing={"md"}/>
                {/*@ts-ignore*/}
                <EmailInput w={"100%"} wrapperComponent={{style: {width: "100%"}}} placeholder={"Email"}
                            left={<IconMail size={16}/>} leftType={"icon"}
                            {...inputs.getInputProps("email")}/>
                <Spacing spacing={"md"}/>
                {/*@ts-ignore*/}
                <TextInput w={"100%"} wrapperComponent={{style: {width: "100%"}}} placeholder={"Username"}
                           left={<IconAt size={16}/>} leftType={"icon"}
                           {...inputs.getInputProps("username")}/>
                <Spacing spacing={"md"}/>
                <PasswordInput w={"100%"} placeholder={"Password"}
                               left={<IconLock size={16}/>} leftType={"icon"}
                               onChange={() => validate("password")}
                               {...inputs.getInputProps("password")}/>
                <Spacing spacing={"md"}/>
                <PasswordInput w={"100%"} placeholder={"Repeat password"}
                               left={<IconLock size={16}/>} leftType={"icon"}
                               onChange={() => validate("repeatPassword")}
                               {...inputs.getInputProps("repeatPassword")}/>
                <Spacing spacing={"xl"}/>
                <Flex justify={"space-between"} align={"center"}>
                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Admin</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>Grant this user administrator privileges.</Text>
                    </Flex>
                    <SwitchInput w={"40px"} {...inputs.getInputProps("admin")}/>
                </Flex>
                <Spacing spacing={"xl"}/>
                <Flex style={{gap: "0.35rem"}} justify={"space-between"}>
                    <Link href={`/users`}>
                        <Button color={"primary"}>
                            Go back to users
                        </Button>
                    </Link>
                    <Button color={"success"} onClick={validate}>
                        Invite user
                    </Button>
                </Flex>
            </Col>
        </Flex>
    </div>
}
