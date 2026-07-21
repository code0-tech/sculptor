"use client"

import React, {startTransition} from "react";
import {
    Button,
    Card,
    Dialog,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    EmailInput,
    emailValidation,
    Flex,
    PasswordInput,
    passwordValidation,
    Row,
    Col,
    Spacing,
    SwitchInput,
    Text,
    TextInput,
    useForm,
    useService
} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {IconAt, IconLock, IconMail, IconUser} from "@tabler/icons-react";
import {UserService} from "@edition/user/services/User.service";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

export interface UserCreateDialogComponentProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const UserCreateDialogComponent: React.FC<UserCreateDialogComponentProps> = ({open, onOpenChange}) => {

    const userService = useService(UserService)

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
                        onOpenChange?.(false)
                        addIslandSuccessNotification({message: "Invited user"})
                    }
                })
            })
        }
    })

    return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent autoFocus showCloseButton title={"Invite a new user"}>
                <Spacing spacing={"xs"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    Create a new user with access to your instance. They can log in with the credentials you provide.
                </Text>
                <Spacing spacing={"xl"}/>
                <Row>
                    <Col xs={6}>
                        <TextInput w={"100%"} placeholder={"Firstname"}
                                   left={<IconUser size={16}/>} leftType={"icon"}
                                   {...inputs.getInputProps("firstname")}/>
                    </Col>
                    <Col xs={6}>
                        <TextInput w={"100%"} placeholder={"Lastname"}
                                   left={<IconUser size={16}/>} leftType={"icon"}
                                   {...inputs.getInputProps("lastname")}/>
                    </Col>
                </Row>
                <Spacing spacing={"md"}/>
                <EmailInput w={"100%"} placeholder={"Email"}
                            left={<IconMail size={16}/>} leftType={"icon"}
                            {...inputs.getInputProps("email")}/>
                <Spacing spacing={"md"}/>
                <TextInput w={"100%"} placeholder={"Username"}
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
                <Spacing spacing={"md"}/>
                <Card color={"tertiary"}>
                    <CardSection border>
                        <Flex justify={"space-between"} align={"center"}>
                            <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                <Text size={"md"} hierarchy={"primary"}>Admin</Text>
                                <Text size={"md"} hierarchy={"tertiary"}>Grant this user administrator privileges.</Text>
                            </Flex>
                            <SwitchInput w={"40px"} {...inputs.getInputProps("admin")}/>
                        </Flex>
                    </CardSection>
                </Card>
                <Spacing spacing={"xl"}/>
                <Flex justify={"space-between"} align={"center"}>
                    <DialogClose asChild>
                        <Button color={"tertiary"}>Cancel</Button>
                    </DialogClose>
                    <Button color={"success"} onClick={validate}>Invite user</Button>
                </Flex>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
