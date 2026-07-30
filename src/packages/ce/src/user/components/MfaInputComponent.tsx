"use client"

import React from "react";
import {TextInput} from "@code0-tech/pictor";
import {TextInputProps} from "@code0-tech/pictor/dist/components/form/TextInput";
import {PinInput, PinInputField} from "@code0-tech/pictor/dist/components/form/PinInput";
import {MfaType} from "@code0-tech/sagittarius-graphql-types";

const TOTP_LENGTH = 6

export interface MfaInputComponentProps extends Omit<TextInputProps, "title" | "description"> {
    type?: MfaType
    onComplete?: (value: string) => void
}

export const MfaInputComponent: React.FC<MfaInputComponentProps> = (props) => {

    const {type = "TOTP", onComplete, ...rest} = props

    return type === "BACKUP_CODE" ? (
        <TextInput w={"100%"}
                   title={"Backup code"}
                   description={"Enter one of your saved backup codes."}
                   placeholder={"Backup code"}
                   {...rest}/>
    ) : (
        <PinInput placeholder={"000000"}
                  title={"Authentication code"}
                  description={"Enter the 6-digit code from your authenticator app."}
                  autoSubmit
                  onAutoSubmit={onComplete}
                  {...(rest as React.ComponentProps<typeof PinInput>)}>
            {Array.from({length: TOTP_LENGTH}).map((_, index) => (
                <PinInputField key={index}/>
            ))}
        </PinInput>
    )
}
