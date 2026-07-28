"use client"

import React from "react";
import {
    Button,
    Card,
    Col,
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
import {TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {User, UsersUpdateInput} from "@code0-tech/sagittarius-graphql-types";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {
    IconAt,
    IconBackground,
    IconLock,
    IconMail,
    IconSettings2,
    IconShield,
    IconShieldLock
} from "@tabler/icons-react";
import {UserSessionsDataTableComponent} from "@edition/user/components/UserSessionsDataTableComponent";
import {UserMfaView} from "@edition/user/views/UserMfaView";
import {SettingDialog} from "@core/components/SettingDialog";

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

    const currentSession = useUserSession()
    const user = React.useMemo(
        () => userService.getById(userId),
        [userStore, userId]
    )

    const isSelf = !!user && !!currentSession?.user?.id && user.id === currentSession.user.id

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
            if (!isSelf) {
                if (values.admin !== (user?.admin ?? false)) payload.admin = values.admin
                if (values.blocked !== (user?.blocked ?? false)) payload.blocked = values.blocked
            }
            if (values.password) {
                payload.password = values.password
                payload.passwordRepeat = values.repeatPassword
            }

            // nothing but the userId changed, so there is nothing to update
            if (Object.keys(payload).length <= 1) {
                return
            }

            startTransition(async () => {
                await userService.usersUpdate(payload).then(payload => {
                    if (payload?.user && (payload?.errors?.length ?? 0) <= 0) {
                        toast({title: "Updated user", color: "success"})
                    }
                })
            })
        }
    })

    return <SettingDialog open={open}
                          onOpenChange={(open) => onOpenChange?.(open)}
                          title={`Settings of @${user?.username ?? ""}`}
                          description={`Edit the general settings, permissions and security for user @${user?.username ?? ""}`}
                          trigger={<TabList>
                              <TabTrigger value={"general"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconBackground size={13}/>
                                      <Text size={"md"}>General</Text>
                                  </Button>
                              </TabTrigger>
                              {!isSelf && (
                                  <TabTrigger value={"permissions"} w={"100%"} asChild>
                                      <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                          <IconShieldLock size={13}/>
                                          <Text size={"md"}>Access</Text>
                                      </Button>
                                  </TabTrigger>
                              )}
                              <TabTrigger value={"security"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconShield size={13}/>
                                      <Text size={"md"}>Security</Text>
                                  </Button>
                              </TabTrigger>
                              {isSelf && (
                                  <TabTrigger value={"mfa"} w={"100%"} asChild>
                                      <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                          <IconSettings2 opacity={0} size={13}/>
                                          <Text size={"md"}>2-Step Verification</Text>
                                      </Button>
                                  </TabTrigger>
                              )}
                              <TabTrigger value={"sessions"} w={"100%"} asChild>
                                  <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                      <IconSettings2 opacity={0} size={13}/>
                                      <Text size={"md"}>Sessions</Text>
                                  </Button>
                              </TabTrigger>
                          </TabList>}>
        <TabContent value={"general"} style={{overflow: "hidden"}}>
            <Flex justify={"space-between"} align={"center"}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>General</Text>
                <Button paddingSize={"xxs"} color={"success"} variant={"none"}
                        onClick={validate}>
                    Save changes
                </Button>

            </Flex>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                The name, email and general profile details for @{user?.username ?? ""}.
            </Text>
            <Spacing spacing={"md"}/>
            <Row>
                <Col xs={6}>
                    <TextInput placeholder={"Firstname"}
                               title={"Firstname"}
                               description={"The user's given name."}
                               {...inputs.getInputProps("firstname")}/>
                </Col>
                <Col xs={6}>
                    <TextInput placeholder={"Lastname"}
                               title={"Lastname"}
                               description={"The user's family name."}
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
        <TabContent value={"permissions"}
                    style={{overflow: "hidden", display: isSelf ? "none" : undefined}}>
            <Flex justify={"space-between"} align={"center"}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Access</Text>
                <Button paddingSize={"xxs"} color={"success"} variant={"none"}
                        onClick={validate}>
                    Save changes
                </Button>
            </Flex>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                Manage administrator privileges and access for @{user?.username ?? ""}.
            </Text>
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
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                Update the password used to sign in to @{user?.username ?? ""}.
            </Text>
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
        {isSelf ? <UserMfaView/> : <></>}
        <TabContent value={"sessions"}
                    style={{
                        overflow: "hidden",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column"
                    }}>
            <Flex justify={"space-between"} align={"center"}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>Sessions</Text>
            </Flex>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                Active sign-in sessions for @{user?.username ?? ""}. Log out a session to revoke
                its access.
            </Text>
            <Spacing spacing={"md"}/>
            <UserSessionsDataTableComponent userId={userId}/>
        </TabContent>
    </SettingDialog>
}
