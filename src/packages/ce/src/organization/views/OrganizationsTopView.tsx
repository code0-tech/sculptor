"use client"

import React from "react";
import {useRouter} from "next/navigation";
import {OrganizationDataTableComponent} from "@edition/organization/components/OrganizationDataTableComponent";

export const OrganizationsTopView = () => {

    const router = useRouter()

    return <>
        <OrganizationDataTableComponent minimized sort={{
            "updatedAt": "desc"
        }} preFilter={(_, index) => index < 5} onSelect={(organization) => {
            const number = organization?.namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
            router.push(`/namespace/${number}`)
        }}/>
    </>

}