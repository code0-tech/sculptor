"use client"

import React from "react";
import {Card, Flex, getSize, Text, useService, useStore} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import Link from "next/link";
import {License} from "@code0-tech/sagittarius-graphql-types";
import {ApplicationService} from "@edition/application/services/Application.service";
import {
    ApplicationLicensesListItemComponent
} from "@ee-internal/application/components/ApplicationLicensesListItemComponent";

export interface ApplicationLicensesListComponentProps {
    preFilter?: (license: License, index: number) => boolean
}

export const ApplicationLicensesListComponent: React.FC<ApplicationLicensesListComponentProps> = (props) => {

    const {preFilter = () => true} = props

    const applicationService = useService(ApplicationService)
    const applicationStore = useStore(ApplicationService)

    const licenses = React.useMemo(
        () => (applicationService.get()?.licenses?.nodes as License[] ?? []).filter(preFilter),
        [applicationStore, preFilter]
    )

    if (licenses.length <= 0) return <Card color={"secondary"} variant={"outlined"}
                                      style={{border: "1px solid rgba(191, 191, 191, 0.1)", boxShadow: "none"}}>
        <CardSection border>
            <Link href={"/licenses/add"} style={{display: "block"}}>
                <Text size={"md"} hierarchy={"tertiary"}>
                    No license connected yet. Add one to unlock the enterprise features.
                </Text>
            </Link>
        </CardSection>
    </Card>

    return <Flex style={{flexDirection: "column", gap: getSize("md")}}>
        {licenses.map(license => (
            <ApplicationLicensesListItemComponent key={license?.id} licenseId={license?.id}/>
        ))}
    </Flex>
}
