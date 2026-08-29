import React, {startTransition} from "react";
import {
    Badge,
    Button,
    Card,
    Flex,
    getSize,
    NumberInput,
    Spacing,
    Text,
    TextInput,
    useForm,
    useService,
    useStore
} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import {ApplicationService} from "@edition/application/services/Application.service";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";

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
                        toast({title: "Updated application", color: "success"})
                    }
                })
            })
        }
    })

    return <TabContent value={"general"}>
        <Flex justify={"space-between"} align={"center"}>
            <Text size={"lg"} hierarchy={"primary"} display={"block"}>Settings</Text>
            <Button paddingSize={"xxs"} color={"success"} variant={"none"} onClick={validate}>Save changes</Button>
        </Flex>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            General configuration for your Sculptor application, including version information, legal links and runtime
            behaviour.
        </Text>
        <Spacing spacing={"md"}/>
        <Text size={"md"} hierarchy={"secondary"}>Versions</Text>
        <Spacing spacing={"lg"}/>
        <Card color={"secondary"}>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
                    <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Sculptor version</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>Version of this application</Text>
                    </Flex>
                    <Badge color={"info"}>
                        <Text c={"inherit"}>{process.env.NEXT_PUBLIC_SCULPTOR_VERSION ?? "Unknown version"}</Text>
                    </Badge>
                </Flex>
            </CardSection>

            <CardSection border>
                <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
                    <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Pictor version</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>Version of the UI component
                            library</Text>
                    </Flex>
                    <Badge color={"info"}>
                        <Text c={"inherit"}>{process.env.NEXT_PUBLIC_PICTOR_VERSION ?? "Unknown version"}</Text>
                    </Badge>
                </Flex>
            </CardSection>
            <CardSection border>
                <Flex justify={"space-between"} align={"center"} style={{gap: getSize("md")}}>
                    <Flex style={{gap: getSize("xxxs"), flexDirection: "column"}}>
                        <Text size={"md"} hierarchy={"primary"}>Sagittarius version</Text>
                        <Text size={"md"} hierarchy={"tertiary"}>Version of the backend</Text>
                    </Flex>
                    <Badge color={"info"} style={{wordBreak: "break-all"}} maw={"50%"}>
                        <Text c={"inherit"}>{application?.metadata?.version ?? "Unknown version"}</Text>
                    </Badge>
                </Flex>
            </CardSection>
        </Card>
        <Spacing spacing={"lg"}/>
        <Text size={"md"} hierarchy={"secondary"}>URLs</Text>
        <Spacing spacing={"lg"}/>
        <Card color={"secondary"}>
            <CardSection border>
                <Text size={"md"} hierarchy={"primary"}>Legal notice url</Text>
                <Spacing spacing={"xxs"}/>
                <Text size={"sm"} hierarchy={"tertiary"}>General configuration for your Sculptor application, including version information, legal links and runtime behaviour.</Text>
                <Spacing spacing={"xs"}/>
                <TextInput clearable
                           placeholder={"https://codezero.build/legal"}
                           {...inputs.getInputProps("legalNoticeUrl")}/>
            </CardSection>
            <CardSection border>
                <Text size={"md"} hierarchy={"primary"}>Privacy information url</Text>
                <Spacing spacing={"xxs"}/>
                <Text size={"sm"} hierarchy={"tertiary"}>General configuration for your Sculptor application, including version information, legal links and runtime behaviour.</Text>
                <Spacing spacing={"xs"}/>

                <TextInput clearable
                           placeholder={"https://codezero.build/privacy"}
                           {...inputs.getInputProps("privacyUrl")}/>
            </CardSection>
            <CardSection border>
                <Text size={"md"} hierarchy={"primary"}>Terms and conditions url</Text>
                <Spacing spacing={"xxs"}/>
                <Text size={"sm"} hierarchy={"tertiary"}>General configuration for your Sculptor application, including version information, legal links and runtime behaviour.</Text>
                <Spacing spacing={"xs"}/>

                <TextInput clearable
                           placeholder={"https://codezero.build/terms"}
                           {...inputs.getInputProps("termsAndConditionsUrl")}/>
            </CardSection>
        </Card>
        <Spacing spacing={"lg"}/>
        <Text size={"md"} hierarchy={"secondary"}>Runtimes</Text>
        <Spacing spacing={"lg"}/>
        <Card color={"secondary"}>
            <CardSection border>
                <Text size={"md"} hierarchy={"primary"}>Max heartbeat interval</Text>
                <Spacing spacing={"xxs"}/>
                <Text size={"sm"} hierarchy={"tertiary"}>The maximum amount of minutes a runtime is shown as connected after the last heartbeat.</Text>
                <Spacing spacing={"xs"}/>

                <NumberInput
                    ref={runtimeHeartbeatInputRef}
                    {...inputs.getInputProps("runtimeMaxHeartbeatIntervalMinutes")}/>
            </CardSection>
        </Card>
    </TabContent>
}