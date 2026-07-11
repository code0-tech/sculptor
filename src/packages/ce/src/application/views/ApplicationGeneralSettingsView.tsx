import React, {startTransition} from "react";
import {Badge, Button, Card, Flex, NumberInput, Spacing, Text, TextInput, useForm, useService, useStore} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {ApplicationService} from "@edition/application/services/Application.service";
import {addIslandSuccessNotification} from "@code0-tech/pictor/dist/components/island/Island.hook";

export const ApplicationGeneralSettingsView: React.FC = () => {

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const application = React.useMemo(
        () => applicationService.get(),
        [applicationStore]
    )

    const initialValues = React.useMemo(
        () => ({
            legalNoticeUrl: !!application?.settings?.legalNoticeUrl ? application?.settings?.legalNoticeUrl : null,
            privacyUrl: !!application?.settings?.privacyUrl ? application?.settings?.privacyUrl : null,
            termsAndConditionsUrl: !!application?.settings?.termsAndConditionsUrl ? application?.settings?.termsAndConditionsUrl : null,
            runtimeMaxHeartbeatIntervalMinutes: application?.settings?.runtimeMaxHeartbeatIntervalMinutes != null
                ? String(application?.settings?.runtimeMaxHeartbeatIntervalMinutes)
                : null,
        }),
        [application]
    )

    // The +/- buttons of NumberInput write to the input element directly without
    // triggering a React change event, so the useForm value goes stale. Read the
    // value from the element itself on submit instead.
    const runtimeHeartbeatInputRef = React.useRef<HTMLInputElement>(null)

    const [inputs, validate] = useForm({
        useInitialValidation: false,
        initialValues: initialValues,
        validate: {},
        onSubmit: (values) => {
            const runtimeMaxHeartbeatIntervalMinutes = runtimeHeartbeatInputRef.current?.value
            startTransition(() => {
                applicationService.applicationUpdate({
                    legalNoticeUrl: !!values.legalNoticeUrl ? values.legalNoticeUrl : null,
                    privacyUrl: !!values.privacyUrl ? values.privacyUrl : null,
                    termsAndConditionsUrl: !!values.termsAndConditionsUrl ? values.termsAndConditionsUrl : null,
                    runtimeMaxHeartbeatIntervalMinutes: !!runtimeMaxHeartbeatIntervalMinutes ? Number(runtimeMaxHeartbeatIntervalMinutes) : null,
                }).then(payload => {
                    if ((payload?.errors?.length ?? 0) <= 0) {
                        addIslandSuccessNotification({
                            message: "Updated application"
                        })
                    }
                })
            })
        }
    })

    return <TabContent value={"general"}>
        <Text size={"xl"} hierarchy={"primary"}>General</Text>
        <Spacing spacing={"xl"}/>
        <Card color={"secondary"}>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Sculptor version</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>Version of this application</Text>
                    </Flex>
                    <Badge color={"info"}>{process.env.NEXT_PUBLIC_SCULPTOR_VERSION}</Badge>
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
                        color={"info"}>{process.env.NEXT_PUBLIC_PICTOR_VERSION}</Badge>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Sagittarius version</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>Version of the backend</Text>
                    </Flex>
                    <Badge color={"info"}>{application?.metadata?.version}</Badge>
                </Flex>
            </CardSection>
        </Card>
        <Spacing spacing={"xl"}/>
        <Flex justify={"space-between"} align={"center"}>
            <Text size={"lg"} hierarchy={"primary"}>Legal url's</Text>
            <Button color={"success"} onClick={validate}>Save</Button>
        </Flex>
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
        <Spacing spacing={"xl"}/>
        <Flex justify={"space-between"} align={"center"}>
            <Text size={"lg"} hierarchy={"primary"}>Runtimes</Text>
            <Button color={"success"} onClick={validate}>Save</Button>
        </Flex>
        <Spacing spacing={"xl"}/>
        <Card color={"secondary"}>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"}>
                    <Flex style={{gap: ".35rem", flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Max heartbeat interval</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>The maximum amount of minutes a runtime is
                            shown as connected after the last heartbeat.</Text>
                    </Flex>
                    <NumberInput ref={runtimeHeartbeatInputRef}
                                 {...inputs.getInputProps("runtimeMaxHeartbeatIntervalMinutes")}/>
                </Flex>
            </CardSection>
        </Card>
    </TabContent>
}