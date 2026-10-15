"use client"

import React from "react";
import {MenuItem} from "@code0-tech/pictor";
import {IconSparkles} from "@tabler/icons-react";
import Link from "next/link";

export interface NamespaceSubscriptionsMenuItemComponentProps {
    namespaceId?: string | number
}

export const NamespaceSubscriptionsMenuItemComponent: React.FC<NamespaceSubscriptionsMenuItemComponentProps> = (props) => {

    const {namespaceId} = props

    return <Link href={`/namespace/${namespaceId}/settings?tab=subscriptions`} prefetch style={{display: "contents"}}>
        <MenuItem>
            <IconSparkles size={16}/>
            Subscriptions
        </MenuItem>
    </Link>
}
