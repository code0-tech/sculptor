import React, {startTransition} from "react";
import {Button, Card, Flex, Spacing, SwitchInput, Text, toast, useForm, useService, useStore} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {ApplicationService} from "@edition/application/services/Application.service";

export const ApplicationRestrictionsView: React.FC = () => {

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const application = React.useMemo(
        () => applicationService.get(),
        [applicationStore]
    )

    const initialValues = React.useMemo(
        () => ({
            adminStatusVisible: application?.settings?.adminStatusVisible,
            organizationCreationRestricted: application?.settings?.organizationCreationRestricted,
            userRegistrationEnabled: application?.settings?.userRegistrationEnabled,
        }),
        [application]
    )

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {},
        onSubmit: (values) => {
            startTransition(() => {
                applicationService.applicationUpdate({
                    adminStatusVisible: values.adminStatusVisible,
                    organizationCreationRestricted: values.organizationCreationRestricted,
                    userRegistrationEnabled: values.userRegistrationEnabled,
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

    return <TabContent value={"restrictions"}>
        <Flex justify={"space-between"} align={"center"}>
            <Text size={"xl"} hierarchy={"primary"}>Restrictions</Text>
            <Button color={"success"} onClick={validate}>Save</Button>
        </Flex>
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

}