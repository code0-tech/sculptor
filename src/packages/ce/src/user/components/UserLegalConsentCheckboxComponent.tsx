"use client";

import React from "react";
import {CheckboxInput, Text, useService, useStore} from "@code0-tech/pictor";
import {CheckboxInputProps} from "@code0-tech/pictor/dist/components/form/CheckboxInput";
import Link from "next/link";
import {ApplicationService} from "@edition/application/services/Application.service";

export const UserLegalConsentCheckboxComponent: React.FC<CheckboxInputProps> = (props) => {

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const application = React.useMemo(
        () => applicationService.get(),
        [applicationStore]
    )

    const privacyUrl = application?.privacyUrl
    const termsAndConditionsUrl = application?.termsAndConditionsUrl

    if (!privacyUrl && !termsAndConditionsUrl) return null

    return <CheckboxInput data-qa-selector={"auth-legal-consent"}
        // @ts-ignore
                          label={
                              <Text hierarchy={"tertiary"} display={"inline"} style={{verticalAlign: "baseline"}}>
                                  {"I agree to the "}
                                  {!!privacyUrl && (
                                      <Link href={privacyUrl} target={"_blank"}
                                            onClick={(event) => event.stopPropagation()}>
                                          <Text hierarchy={"primary"} display={"inline"}
                                                style={{verticalAlign: "baseline"}}>
                                              Privacy Policy
                                          </Text>
                                      </Link>
                                  )}
                                  {!!privacyUrl && !!termsAndConditionsUrl ? " and " : null}
                                  {!!termsAndConditionsUrl && (
                                      <Link href={termsAndConditionsUrl} target={"_blank"}
                                            onClick={(event) => event.stopPropagation()}>
                                          <Text hierarchy={"primary"} display={"inline"}
                                                style={{verticalAlign: "baseline"}}>
                                              Terms &amp; Conditions
                                          </Text>
                                      </Link>
                                  )}
                              </Text>
                          }
                          {...props}/>
}
