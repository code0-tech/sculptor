"use client"

import React, {startTransition} from "react";
import {
    Badge,
    Button,
    Card,
    DResizableHandle,
    DResizablePanel,
    DResizablePanelGroup,
    Flex,
    Spacing,
    SwitchInput,
    Text, TextInput,
    toast,
    useForm,
    useService,
    useStore,
    useUserSession
} from "@code0-tech/pictor";
import {UserService} from "@edition/user/services/User.service";
import {notFound} from "next/navigation";
import {Tab, TabContent, TabList, TabTrigger} from "@code0-tech/pictor/dist/components/tab/Tab";
import {IconLayoutSidebar} from "@tabler/icons-react";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {ApplicationService} from "@edition/application/services/Application.service";

export const ApplicationSettingsPage: React.FC = () => {

    const userStore = useStore(UserService)
    const userService = useService(UserService)
    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const currentSession = useUserSession()

    const currentUser = React.useMemo(
        () => userService.getById(currentSession?.user?.id),
        [userStore, currentSession]
    )

    const application = React.useMemo(
        () => applicationService.get(),
        [applicationStore]
    )

    if (currentUser && !currentUser.admin) {
        notFound()
    }

    const initialValues = React.useMemo(
        () => ({
            adminStatusVisible: application?.settings?.adminStatusVisible,
            organizationCreationRestricted: application?.settings?.organizationCreationRestricted,
            userRegistrationEnabled: application?.settings?.userRegistrationEnabled,
            legalNoticeUrl: application?.settings?.legalNoticeUrl,
            privacyUrl: application?.settings?.privacyUrl,
            termsAndConditionsUrl: application?.settings?.termsAndConditionsUrl,
        }),
        []
    )

    const [inputs, validate] = useForm({
        initialValues: initialValues,
        validate: {},
        onSubmit: (values) => {
            startTransition(() => {
                applicationService.applicationUpdate({
                    adminStatusVisible: values.adminStatusVisible,
                    organizationCreationRestricted: values.organizationCreationRestricted,
                    userRegistrationEnabled: values.userRegistrationEnabled,
                    legalNoticeUrl: values.legalNoticeUrl,
                    privacyUrl: values.privacyUrl,
                    termsAndConditionsUrl: values.termsAndConditionsUrl,
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        toast({
                            title: "The application was successfully updated.",
                            color: "success",
                            dismissible: true,
                        })
                    }
                })
            })
        }
    })

    return <Tab orientation={"vertical"} defaultValue={"general"} h={"100%"}>
        <DResizablePanelGroup>
            <DResizablePanel id={"1"} defaultSize={"20%"} collapsedSize={"0%"}
                             collapsible minSize={"10%"} style={{textWrap: "nowrap"}}>
                <Flex style={{flexDirection: "column", gap: "0.7rem"}}>
                    <Flex style={{gap: "0.7rem"}} align={"center"} justify={"space-between"}>
                        <Text size={"md"} hierarchy={"secondary"}>Application settings</Text>

                        <Button variant={"none"} paddingSize={"xxs"}>
                            <IconLayoutSidebar size={16}/>
                        </Button>
                    </Flex>
                    <Text size={"sm"} hierarchy={"tertiary"} style={{textWrap: "wrap"}}>
                        General settings and restrictions for your Sculptor application. These settings affect all users
                        and organizations within the application.
                    </Text>
                    <TabList>
                        <TabTrigger value={"general"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>General</Text>
                            </Button>
                        </TabTrigger>
                        <TabTrigger value={"restrictions"} w={"100%"} asChild>
                            <Button paddingSize={"xxs"} variant={"none"} justify={"start"}>
                                <Text size={"md"}>Restrictions</Text>
                            </Button>
                        </TabTrigger>
                    </TabList>
                </Flex>
            </DResizablePanel>
            <DResizableHandle/>
            <DResizablePanel id={"2"} color={"primary"} p={1} style={{borderTopLeftRadius: "1rem"}}>
                <>
                    <TabContent value={"general"}>
                        <Text size={"xl"} hierarchy={"primary"}>General</Text>
                        <Spacing spacing={"xl"}/>
                        <Card color={"secondary"}>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Sculptor version</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Version of this application</Text>
                                    </Flex>
                                    <Badge color={"info"}>v0.0.0-mvp.1</Badge>
                                </Flex>
                            </CardSection>

                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Pictor version</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Version of the UI component
                                            library</Text>
                                    </Flex>
                                    <Badge
                                        color={"info"}>v0.0.0-mvp.10</Badge>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Sagittarius version</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Version of the backend</Text>
                                    </Flex>
                                    <Badge color={"info"}>2134929721-ee</Badge>
                                </Flex>
                            </CardSection>
                        </Card>
                        <Spacing spacing={"xl"}/>
                        <Text size={"lg"} hierarchy={"primary"}>Legal url's</Text>
                        <Spacing spacing={"xl"}/>
                        <Card color={"secondary"}>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Legal notice url</Text>
                                    </Flex>
                                    <TextInput {...inputs.getInputProps("legalNoticeUrl")}/>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Privacy information url</Text>
                                    </Flex>
                                    <TextInput {...inputs.getInputProps("privacyUrl")}/>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Terms and conditions url</Text>
                                    </Flex>
                                    <TextInput {...inputs.getInputProps("termsAndConditionsUrl")}/>
                                </Flex>
                            </CardSection>
                        </Card>
                    </TabContent>
                    <TabContent value={"restrictions"}>
                        <Text size={"xl"} hierarchy={"primary"}>Restrictions</Text>
                        <Spacing spacing={"xl"}/>
                        <Card color={"secondary"}>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Organization creation</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Set if organization creation is
                                            restricted
                                            to
                                            administrators.</Text>
                                    </Flex>
                                    <SwitchInput w={"40px"}
                                                 {...inputs.getInputProps("organizationCreationRestricted")}/>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>User registration</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Set if user registration is
                                            enabled.</Text>
                                    </Flex>
                                    <SwitchInput w={"40px"}
                                                 {...inputs.getInputProps("userRegistrationEnabled")}/>
                                </Flex>
                            </CardSection>
                            <CardSection border>
                                <Flex justify={"space-between"} align={"center"}>
                                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                                        <Text size={"md"} hierarchy={"primary"}>Admin status</Text>
                                        <Text size={"md"} hierarchy={"tertiary"}>Set if users can se who is admin</Text>
                                    </Flex>
                                    <SwitchInput w={"40px"}
                                                 {...inputs.getInputProps("adminStatusVisible")}/>
                                </Flex>
                            </CardSection>
                        </Card>

                    </TabContent>
                </>
            </DResizablePanel>
        </DResizablePanelGroup>
    </Tab>
}