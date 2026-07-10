"use client"

import React from "react";
import {useRouter} from "next/navigation";
import {NamespaceDataTableComponent} from "@edition/namespace/components/NamespaceDataTableComponent";

export const NamespacesTopView = () => {

    const router = useRouter()

    return <>
        <NamespaceDataTableComponent minimized sort={{
            "updatedAt": "desc"
        }} preFilter={(_, index) => index < 5} onSelect={(namespace) => {
            const number = namespace?.id?.match(/Namespace\/(\d+)$/)?.[1]
            router.push(`/namespace/${number}`)
        }}/>
    </>

}
