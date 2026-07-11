"use client"

import React from "react";
import {
    Badge,
    Button,
    Card,
    Col,
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
    Spacing,
    SwitchInput,
    Text,
    TextAreaInput,
    TextInput,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {User, UsersUpdateInput} from "@code0-tech/sagittarius-graphql-types";
import {UserService} from "@edition/user/services/User.service";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";
import {IconAt, IconLock, IconMail, IconUser} from "@tabler/icons-react";
import {Layout} from "@code0-tech/pictor/dist/components/layout/Layout";
import {motion} from "framer-motion";

export interface UserEditDialogComponentProps {
    userId?: User['id']
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export const UserEditDialogComponent: React.FC<UserEditDialogComponentProps> = (props) => {

    const {userId, open, onOpenChange} = props

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const [, startTransition] = React.useTransition()

    const user = React.useMemo(
        () => userService.getById(userId),
        [userStore, userId]
    )

    const initialValues = React.useMemo(() => ({
        firstname: user?.firstname ?? null,
        lastname: user?.lastname ?? null,
        email: user?.email ?? null,
        username: user?.username ?? null,
        readme: user?.readme ?? null,
        admin: user?.admin ?? false,
        blocked: user?.blocked ?? false,
        password: null,
        repeatPassword: null,
    }), [user])

    const [inputs, validate] = useForm<{
        firstname: string | null,
        lastname: string | null,
        email: string | null,
        username: string | null,
        readme: string | null,
        admin: boolean | null,
        blocked: boolean | null,
        password: string | null,
        repeatPassword: string | null,
    }>({
        useInitialValidation: false,
        initialValues: initialValues,
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
            password: (value) => {
                if (!value) return null
                return passwordValidation(value)
            },
            repeatPassword: (value, values) => {
                if (!values?.password) return null
                if (passwordValidation(value) != null) return passwordValidation(value)
                if (value != values?.password) return "Passwords do not match"
                return null
            }
        },
        onSubmit: (values) => {
            if (!userId) return
            if (!values.email || !values.username) return

            const payload: UsersUpdateInput = {userId: userId}
            if (values.email !== (user?.email ?? null)) payload.email = values.email
            if (values.username !== (user?.username ?? null)) payload.username = values.username
            if (values.firstname !== (user?.firstname ?? null)) payload.firstname = values.firstname
            if (values.lastname !== (user?.lastname ?? null)) payload.lastname = values.lastname
            if (values.readme !== (user?.readme ?? null)) payload.readme = values.readme
            if (values.admin !== (user?.admin ?? false)) payload.admin = values.admin
            if (values.blocked !== (user?.blocked ?? false)) payload.blocked = values.blocked
            if (values.password) {
                payload.password = values.password
                payload.passwordRepeat = values.repeatPassword
            }

            // nothing but the userId changed, so there is nothing to update
            if (Object.keys(payload).length <= 1) {
                onOpenChange?.(false)
                return
            }

            startTransition(async () => {
                await userService.usersUpdate(payload).then(payload => {
                    if (payload?.user && (payload?.errors?.length ?? 0) <= 0) {
                        onOpenChange?.(false)
                        addIslandSuccessNotification({
                            message: "Updated user",
                        })
                    }
                })
            })
        }
    })

    return <Dialog open={open} onOpenChange={(open) => onOpenChange?.(open)}>
        <DialogPortal>
            <DialogOverlay/>
            <DialogContent
                style={{padding: "2px"}}
                w={"75%"} h={"75%"}>
                <Tab orientation={"vertical"} defaultValue={"general"} w={"100%"} h={"100%"}>
                    <Layout layoutGap={0} showLayoutSplitter={false}
                            leftContent={
                                <motion.div layout
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                                mass: 0.8
                                            }}
                                            initial={{
                                                width: "200px",
                                            }}
                                            whileInView={{
                                                width: "200px",
                                            }}
                                            whileHover={{
                                                width: "250px",
                                            }}
                                            style={{
                                                padding: "0.7rem",
                                                paddingTop: "1rem",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column"
                                            }}
                                >
                                    <Text size={"lg"} hierarchy={"secondary"}>
                                        Settings of @{user?.username ?? ""}
                                    </Text>
                                    <Spacing spacing={"xxs"}/>
                                    <Text size={"sm"} maw={"150px"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                                        Edit the general settings, permissions and security for user
                                        @{user?.username ?? ""}
                                    </Text>
                                    <Spacing spacing={"md"}/>
                                    <TabList>
                                        <TabTrigger value={"general"} w={"100%"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                                <Text size={"md"}>General</Text>
                                            </Button>
                                        </TabTrigger>
                                        <TabTrigger value={"permissions"} w={"100%"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                                <Text size={"md"}>Permissions</Text>
                                            </Button>
                                        </TabTrigger>
                                        <TabTrigger value={"security"} w={"100%"} asChild>
                                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                                <Text size={"md"}>Security</Text>
                                            </Button>
                                        </TabTrigger>
                                    </TabList>
                                    <DialogClose asChild style={{ marginTop: "auto" }}>
                                        <Button paddingSize={"xxs"} w={"100%"} variant={"none"} justify={"space-between"}>
                                            <Text size={"md"}>Close</Text>
                                            <Badge>
                                                ESC
                                            </Badge>
                                        </Button>
                                    </DialogClose>
                                </motion.div>
                            }>
                        <Card color={"primary"} paddingSize={"md"} h={"100%"} w={"100%"}>
                            <TabContent value={"general"} style={{overflow: "hidden"}}>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Text size={"lg"} hierarchy={"primary"} display={"block"}>General</Text>
                                    <Button paddingSize={"xxs"} color={"success"} variant={"none"}
                                            onClick={validate}>
                                        Save changes
                                    </Button>

                                </Flex>
                                <Spacing spacing={"md"}/>
                                <Row>
                                    <Col xs={6}>
                                        <TextInput placeholder={"Firstname"}
                                                   title={"Firstname"}
                                                   description={"The user's given name."}
                                                   left={<IconUser size={16}/>} leftType={"icon"}
                                                   {...inputs.getInputProps("firstname")}/>
                                    </Col>
                                    <Col xs={6}>
                                        <TextInput placeholder={"Lastname"}
                                                   title={"Lastname"}
                                                   description={"The user's family name."}
                                                   left={<IconUser size={16}/>} leftType={"icon"}
                                                   {...inputs.getInputProps("lastname")}/>
                                    </Col>
                                </Row>

                                <Spacing spacing={"md"}/>

                                <EmailInput w={"100%"}
                                            placeholder={"Email"}
                                            title={"Email"}
                                            description={"The email address used to sign in and receive notifications."}
                                            left={<IconMail size={16}/>} leftType={"icon"}
                                            {...inputs.getInputProps("email")}/>
                                <Spacing spacing={"md"}/>
                                <TextInput w={"100%"}
                                           placeholder={"Username"}
                                           title={"Username"}
                                           description={"The unique handle used to identify the user."}
                                           left={<IconAt size={16}/>} leftType={"icon"}
                                           {...inputs.getInputProps("username")}/>
                                <Spacing spacing={"md"}/>
                                <TextAreaInput w={"100%"} placeholder={"Readme"}
                                               title={"Readme"}
                                               description={"A short bio or notes shown on the user's profile."}
                                               {...inputs.getInputProps("readme")}/>
                            </TabContent>
                            <TabContent value={"permissions"} style={{overflow: "hidden"}}>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Text size={"lg"} hierarchy={"primary"} display={"block"}>Permissions</Text>
                                    <Button paddingSize={"xxs"} color={"success"} variant={"none"}
                                            onClick={validate}>
                                        Save changes
                                    </Button>
                                </Flex>
                                <Spacing spacing={"md"}/>
                                <Card color={"secondary"}>
                                    <CardSection border>
                                        <Flex justify={"space-between"} align={"center"}>
                                            <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                                <Text size={"md"} hierarchy={"primary"}>Admin</Text>
                                                <Text size={"md"} hierarchy={"tertiary"}>
                                                    Grant this user administrator privileges.
                                                </Text>
                                            </Flex>
                                            <SwitchInput w={"40px"} {...inputs.getInputProps("admin")}/>
                                        </Flex>
                                    </CardSection>
                                    <CardSection border>
                                        <Flex justify={"space-between"} align={"center"}>
                                            <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                                <Text size={"md"} hierarchy={"primary"}>Blocked</Text>
                                                <Text size={"md"} hierarchy={"tertiary"}>
                                                    Block this user from accessing the application.
                                                </Text>
                                            </Flex>
                                            <SwitchInput w={"40px"} {...inputs.getInputProps("blocked")}/>
                                        </Flex>
                                    </CardSection>
                                </Card>
                            </TabContent>
                            <TabContent value={"security"} style={{overflow: "hidden"}}>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Text size={"lg"} hierarchy={"primary"} display={"block"}>Security</Text>
                                    <Button paddingSize={"xxs"} color={"success"} variant={"none"}
                                            onClick={validate}>
                                        Save changes
                                    </Button>

                                </Flex>
                                <Spacing spacing={"md"}/>
                                <PasswordInput w={"100%"} placeholder={"New password"}
                                               title={"New password"}
                                               description={"Set a new password for the user. Leave blank to keep the current one."}
                                               left={<IconLock size={16}/>} leftType={"icon"}
                                               onChange={() => validate("password")}
                                               {...inputs.getInputProps("password")}/>
                                <Spacing spacing={"md"}/>
                                <PasswordInput w={"100%"} placeholder={"Repeat new password"}
                                               title={"Repeat new password"}
                                               description={"Re-enter the new password to check for typos."}
                                               left={<IconLock size={16}/>} leftType={"icon"}
                                               onChange={() => validate("repeatPassword")}
                                               {...inputs.getInputProps("repeatPassword")}/>
                            </TabContent>
                        </Card>
                    </Layout>
                </Tab>
            </DialogContent>
        </DialogPortal>
    </Dialog>
}
