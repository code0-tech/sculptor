"use client"

import React from "react";
import {Button, Card, Flex, Spacing, Text, useForm, useService, useStore} from "@code0-tech/pictor";
import {PinInput, PinInputField} from "@code0-tech/pictor/dist/components/form/PinInput";
import {ButtonGroup} from "@code0-tech/pictor/dist/components/button-group/ButtonGroup";
import {InputWrapper} from "@code0-tech/pictor/dist/components/form/InputWrapper";
import {toast} from "@code0-tech/pictor/dist/components/toast/Toast";
import {useCopyToClipboard} from "@uidotdev/usehooks";
import {IconCheck, IconCopy, IconDownload} from "@tabler/icons-react";
import {UserService} from "@edition/user/services/User.service";
import {useUserSession} from "@edition/user/hooks/User.session.hook";
import {QrCodeComponent} from "@core/components/QrCodeComponent";
import {TabContent} from "@code0-tech/pictor/dist/components/tab/Tab";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";

// Fallback used during SSR (no `window`) or when the hostname can't be read.
const DEFAULT_ISSUER = "codezero.build"

// The issuer identifies which instance a TOTP entry belongs to in the
// authenticator app. Derive it from the hostname the user accessed the app
// over so entries from different instances stay distinguishable.
const resolveIssuer = (): string =>
    (typeof window !== "undefined" && window.location.hostname) || DEFAULT_ISSUER

const buildOtpAuthUri = (secret: string, account: string, issuer: string): string => {
    const label = encodeURIComponent(`${issuer}:${account}`)
    const params = new URLSearchParams({secret, issuer})
    return `otpauth://totp/${label}?${params.toString()}`
}

const downloadBackupCodes = (codes: string[], issuer: string): void => {
    const content = [
        `${issuer} backup codes`,
        `Generated: ${new Date().toLocaleString()}`,
        "",
        ...codes,
        "",
        "Each code can be used once. Store them somewhere safe — they are the only",
        "way to sign in if you lose access to your authenticator app.",
    ].join("\n")

    const blob = new Blob([content], {type: "text/plain"})
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${issuer}-backup-codes.txt`
    anchor.click()
    URL.revokeObjectURL(url)
}

export const UserMfaView: React.FC = () => {

    const userService = useService(UserService)
    const userStore = useStore(UserService)
    const session = useUserSession()

    const user = React.useMemo(
        () => userService.getById(session?.user?.id),
        [userStore, session]
    )

    const [copiedText, copyToClipboard] = useCopyToClipboard()
    const [, startTransition] = React.useTransition()

    const [secret, setSecret] = React.useState<string | null>(null)
    const [signedSecret, setSignedSecret] = React.useState<string | null>(null)
    const [backupCodes, setBackupCodes] = React.useState<string[] | null>(null)

    const totpEnabled = user?.mfaStatus?.totpEnabled ?? false
    const backupCodesCount = user?.mfaStatus?.backupCodesCount ?? 0
    const account = user?.email ?? user?.username ?? "account"
    const issuer = React.useMemo(resolveIssuer, [])

    const initialValues = React.useMemo(() => ({code: ""}), [])

    const [inputs, validate] = useForm<{ code: string }>({
        useInitialValidation: false,
        initialValues,
        validate: {
            code: (value) => (!value || value.length < 6) ? "Enter the 6-digit code from your authenticator app" : null
        },
        onSubmit: (values) => {
            if (!signedSecret) return
            startTransition(() => {
                userService.usersMfaTotpValidateSecret({
                    currentTotp: values.code,
                    secret: signedSecret
                }).then(payload => {
                    if (!payload?.user || (payload.errors?.length ?? 0) > 0) {
                        toast({title: "That code isn't valid. Please try again.", color: "error"})
                        return
                    }
                    userService.usersMfaBackupCodesRotate({}).then(rotate => {
                        setSecret(null)
                        setSignedSecret(null)
                        setBackupCodes(rotate?.codes ?? [])
                        toast({title: "Two-factor authentication enabled", color: "success"})
                    })
                })
            })
        }
    })

    return <TabContent value={"mfa"} style={{overflow: "hidden"}}>
        <Text size={"lg"} hierarchy={"primary"} display={"block"}>
            2-Step Verification
        </Text>
        <Spacing spacing={"xs"}/>
        <Text size={"md"} hierarchy={"tertiary"}>
            Add a second step to your sign-in using an authenticator app and backup codes.
        </Text>
        <Spacing spacing={"md"}/>

        {backupCodes ? (
            <>
                <Text size={"md"} hierarchy={"secondary"}>Save your backup codes</Text>
                <Spacing spacing={"xs"}/>
                <Text size={"md"} hierarchy={"tertiary"} display={"block"}>
                    Each code can be used once if you lose access to your authenticator app. Store them
                    somewhere safe — you won't be able to see them again.
                </Text>
                <Spacing spacing={"xs"}/>
                <Card color={"secondary"}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: ".5rem",
                        fontFamily: "monospace"
                    }}>
                        {backupCodes.map((backupCode) => (
                            <Text key={backupCode} size={"md"} hierarchy={"primary"}>{backupCode}</Text>
                        ))}
                    </div>
                </Card>
                <Spacing spacing={"md"}/>
                <Flex style={{gap: ".7rem", textWrap: "nowrap"}}>
                    <Flex style={{gap: ".35rem"}}>
                        <Button color={"primary"} onClick={() => downloadBackupCodes(backupCodes, issuer)}>
                            <IconDownload size={16}/>
                            Download backup codes
                        </Button>
                        <Button color={"primary"}
                                onClick={() => copyToClipboard(backupCodes.join("\n"))}>
                            <IconCopy size={16}/>
                            {Boolean(copiedText) ? "Copied" : "Copy"}
                        </Button>
                    </Flex>
                    <Button w={"100%"}
                            color={"success"}
                            onClick={() => setBackupCodes(null)}
                            style={{marginLeft: "auto"}}>
                        Done
                    </Button>
                </Flex>
            </>
        ) : secret ? (
            <>
                <Card color={"secondary"}>
                    <CardSection border>
                        <Flex justify={"space-between"} align={"start"} style={{gap: "1.3rem"}}>
                            <div>
                                <Text size={"md"} hierarchy={"secondary"}>1. Scan the QR code</Text>
                                <Spacing spacing={"xs"}/>
                                <Text size={"md"} hierarchy={"tertiary"}>
                                    Scan this QR code with your authenticator app, or enter the setup key below
                                    manually.
                                </Text>
                                <Spacing spacing={"xs"}/>
                                <InputWrapper right={
                                    <ButtonGroup color={"primary"}>
                                        <Button onClick={() => copyToClipboard(secret)}
                                                paddingSize={"xxs"} variant={"none"} color={"secondary"}>
                                            {Boolean(copiedText) ? <IconCheck size={13}/> : <IconCopy size={13}/>}
                                        </Button>
                                    </ButtonGroup>
                                }>
                                    <div style={{alignSelf: "center", flex: "1 1 auto", minWidth: 0}}>
                                        <Text style={{fontFamily: "monospace", wordBreak: "break-all"}}>{secret}</Text>
                                    </div>
                                </InputWrapper>
                            </div>
                            <div>
                                <QrCodeComponent value={buildOtpAuthUri(secret, account, issuer)} size={132}/>
                            </div>
                        </Flex>
                    </CardSection>
                    <CardSection border>
                        <Text size={"md"} hierarchy={"secondary"}>2. Enter the code</Text>
                        <Spacing spacing={"xs"}/>
                        <Text size={"md"} hierarchy={"tertiary"}>
                            Enter the 6-digit code from your authenticator app to confirm it's set up correctly.
                        </Text>
                        <Spacing spacing={"xs"}/>
                        <PinInput placeholder={"000000"}
                                  autoFocus
                                  onAutoSubmit={() => validate()}
                                  {...inputs.getInputProps("code")}>
                            {Array.from({length: 6}).map((_, index) => (
                                <PinInputField key={index}/>
                            ))}
                        </PinInput>
                    </CardSection>
                </Card>
                <Spacing spacing={"md"}/>
                <Flex style={{gap: ".5rem"}}>
                    <Button w={"100%"}
                            color={"secondary"}
                            variant={"outlined"}
                            onClick={() => {
                                setSecret(null)
                                setSignedSecret(null)
                            }}>
                        Cancel
                    </Button>
                    <Button w={"100%"} color={"success"} onClick={validate}>
                        Verify
                    </Button>
                </Flex>
            </>
        ) : totpEnabled ? (
            <>
                <Text size={"md"} hierarchy={"secondary"}>Two-factor authentication is enabled.</Text>
                <Spacing spacing={"xs"}/>
                <Text size={"md"} hierarchy={"tertiary"}>
                    {backupCodesCount} unused backup {backupCodesCount === 1 ? "code" : "codes"} remaining.
                    Regenerating replaces all existing codes.
                </Text>
                <Spacing spacing={"md"}/>
                <Button w={"100%"} color={"secondary"} onClick={() => startTransition(() => {
                    userService.usersMfaBackupCodesRotate({}).then(payload => {
                        if (!payload?.codes || (payload.errors?.length ?? 0) > 0) return
                        setBackupCodes(payload.codes)
                    })
                })}>
                    Regenerate backup codes
                </Button>
            </>
        ) : (
            <Button w={"100%"} color={"success"} onClick={() => startTransition(() => {
                userService.usersMfaTotpGenerateSecret({}).then(payload => {
                    if (!payload?.secret || !payload?.signedSecret || (payload.errors?.length ?? 0) > 0) return
                    setSecret(payload.secret)
                    setSignedSecret(payload.signedSecret)
                })
            })}>Set up authenticator app</Button>
        )}
    </TabContent>
}
