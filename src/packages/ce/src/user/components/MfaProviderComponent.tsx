"use client"

import React from "react";
import {
    Button,
    Flex,
    InputMessage,
    SegmentedControl,
    SegmentedControlItem,
    Spacing,
    Text,
    useForm
} from "@code0-tech/pictor";
import {MfaInput, MfaType} from "@code0-tech/sagittarius-graphql-types";
import {MfaInputComponent} from "@edition/user/components/MfaInputComponent";
import {InputDialog} from "@core/components/InputDialog";

// Error codes signalling that an operation needs a fresh second factor.
const MFA_TRIGGER_ERRORS = ["MFA_REQUIRED", "MFA_FAILED"]
// Codes returned when a supplied code was wrong — keep the dialog open to retry.
const MFA_RETRYABLE_ERRORS = ["MFA_REQUIRED", "MFA_FAILED", "WRONG_TOTP", "INVALID_TOTP_SECRET"]

interface MfaDialogOptions {
    error?: string
}

// The dialog handle held below in React state and passed into withMfaRetry.
interface MfaDialog {
    request: (options?: MfaDialogOptions) => Promise<MfaInput | null>
    close: () => void
}

// Returned by useMfa(): wraps an operation with MFA step-up so callers only pass the operation.
export interface WithMfa {
    <T extends PayloadWithErrors | undefined>(operation: (mfa?: MfaInput) => Promise<T>): Promise<T>
}

interface ErrorLike {
    errorCode?: string | null
}

interface PayloadWithErrors {
    errors?: (ErrorLike | null)[] | null
}

const hasError = (payload: PayloadWithErrors | undefined, codes: string[]): boolean =>
    !!payload?.errors?.some(error => !!error?.errorCode && codes.includes(error.errorCode))

const requestAndRetry = async <T extends PayloadWithErrors | undefined>(
    operation: (mfa?: MfaInput) => Promise<T>,
    dialog: MfaDialog,
    previous: T,
    error?: string
): Promise<T> => {
    const mfa = await dialog.request({error})
    if (!mfa) return previous // user cancelled — surface the MFA-required payload

    const result = await operation(mfa)
    if (hasError(result, MFA_RETRYABLE_ERRORS)) {
        return requestAndRetry(operation, dialog, result, "The code you entered is invalid. Please try again.")
    }

    dialog.close()
    return result
}

const withMfaRetry = async <T extends PayloadWithErrors | undefined>(
    operation: (mfa?: MfaInput) => Promise<T>,
    dialog: MfaDialog
): Promise<T> => {
    const result = await operation()
    if (!hasError(result, MFA_TRIGGER_ERRORS)) return result
    return requestAndRetry(operation, dialog, result)
}

const MfaContext = React.createContext<WithMfa | null>(null)

export const useMfa = (): WithMfa => {
    const withMfa = React.useContext(MfaContext)
    if (!withMfa) throw new Error("useMfa must be used within an MfaProviderComponent")
    return withMfa
}

export const MfaProviderComponent: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const [state, setState] = React.useState<{ open: boolean; error?: string; loading: boolean }>({
        open: false,
        loading: false
    })

    const [requestId, setRequestId] = React.useState(0)
    const resolverRef = React.useRef<((value: MfaInput | null) => void) | null>(null)
    const [type, setType] = React.useState("TOTP")

    const resolve = React.useCallback((value: MfaInput | null) => {
        const resolver = resolverRef.current
        resolverRef.current = null
        resolver?.(value)
    }, [])

    const request = React.useCallback((options: MfaDialogOptions = {}) =>
        new Promise<MfaInput | null>((resolve) => {
            resolverRef.current?.(null)
            resolverRef.current = resolve
            setRequestId(id => id + 1)
            setState({open: true, error: options.error, loading: false})
        }), [])

    const close = React.useCallback(() => {
        setState({open: false, error: undefined, loading: false})
    }, [])

    const dialog = React.useMemo<MfaDialog>(() => ({request, close}), [request, close])

    const withMfa = React.useMemo<WithMfa>(() => (operation) => withMfaRetry(operation, dialog), [dialog])

    const initialValues = React.useMemo<{ code: string | null }>(() => ({code: null}), [requestId])

    const [inputs, validate] = useForm<{ code: string | null }>({
        useInitialValidation: false,
        initialValues,
        validate: {
            code: (value) => !value ? "Enter a code from your authenticator app or a backup code" : null
        },
        onSubmit: (values) => {
            if (!values.code) return
            setState(prev => ({...prev, loading: true}))
            resolve({type: type as MfaType, value: values.code})
        }
    })

    const onOpenChange = (open: boolean) => {
        if (open) return
        resolve(null)
        setState({open: false, error: undefined, loading: false})
    }

    return <MfaContext.Provider value={withMfa}>
        {children}
        <InputDialog title={"Confirm it's you"}
                     description={"This action requires multi-factor authentication. Enter a code from your authenticator app or one of your backup codes to continue."}
                     open={state.open}
                     onOpenChange={onOpenChange}>
            <Flex justify={"space-between"} align={"center"}>
                <Text size={"lg"} hierarchy={"primary"} display={"block"}>
                    Confirm it's you
                </Text>
                <SegmentedControl type={"single"}
                                  value={type}
                                  tabIndex={-1}
                                  onValueChange={(next) => {
                                      setType(next as MfaType)
                                      inputs.getInputProps("code")?.formValidation?.setValue?.(null)
                                  }}>
                    <SegmentedControlItem tabIndex={-1} w={"100%"} value={"TOTP"}>
                        <Text>Authenticator</Text>
                    </SegmentedControlItem>
                    <SegmentedControlItem tabIndex={-1} w={"100%"} value={"BACKUP_CODE"}>
                        <Text>Backup code</Text>
                    </SegmentedControlItem>
                </SegmentedControl>
            </Flex>
            <Spacing spacing={"xs"}/>
            <Text size={"md"} hierarchy={"tertiary"}>
                This action requires multi-factor authentication. Enter a code from your authenticator app or one of your backup codes to continue.
            </Text>
            <Spacing spacing={"md"}/>
            <MfaInputComponent key={requestId}
                               type={type as MfaType}
                               autoFocus={true}
                               disabled={state.loading}
                               onComplete={() => validate()}
                               {...inputs.getInputProps("code")}/>
            {state.error ? <InputMessage>{state.error}</InputMessage> : <></>}
            <Spacing spacing={"md"}/>
            <Button disabled={state.loading} color={"success"} w={"100%"} onClick={() => validate()}>
                {state.loading ? "Verifying..." : "Confirm"}
            </Button>
        </InputDialog>
    </MfaContext.Provider>
}
