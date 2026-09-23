"use client"

import React from "react";
import {Card, Flex, getSize, Text, useService, useStore} from "@code0-tech/pictor";
import CardSection from "@code0-tech/pictor/dist/components/card/CardSection";
import Link from "next/link";
import {License, Namespace} from "@code0-tech/sagittarius-graphql-types";
import {NamespaceService} from "@edition/namespace/services/Namespace.service";
import {
    NamespaceLicensesListItemComponent
} from "@cloud-internal/namespace/components/NamespaceLicensesListItemComponent";

export interface NamespaceLicensesListComponentProps {
    namespaceId: Namespace['id']
    preFilter?: (license: License, index: number) => boolean
}

export const NamespaceLicensesListComponent: React.FC<NamespaceLicensesListComponentProps> = (props) => {

    const {namespaceId, preFilter = () => true} = props

    const namespaceService = useService(NamespaceService)
    const namespaceStore = useStore(NamespaceService)

    const licenses = React.useMemo(
        () => (namespaceService.getById(namespaceId)?.licenses?.nodes as License[] ?? []).filter(preFilter),
        [namespaceStore, namespaceId, preFilter]
    )

    if (licenses.length <= 0) return <Card color={"secondary"} variant={"outlined"}
                                      style={{border: "1px solid rgba(191, 191, 191, 0.1)", boxShadow: "none"}}>
        <CardSection border>
            <Link href={`/upgrade?namespace=${namespaceId?.match(/Namespace\/(\d+)$/)?.[1]}`}
                  style={{display: "block"}}>
                <Text size={"md"} hierarchy={"tertiary"}>
                    No license connected yet. Upgrade your plan to unlock the cloud features.
                </Text>
            </Link>
        </CardSection>
    </Card>

    return <Flex style={{flexDirection: "column", gap: getSize("md")}}>
        {licenses.map(license => (
            <NamespaceLicensesListItemComponent key={license?.id}
                                                namespaceId={namespaceId}
                                                licenseId={license?.id}/>
        ))}
    </Flex>
}
