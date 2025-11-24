"use client"

import React from "react";
import {NamespaceProjectsView} from "@edition/dashboard/namespace/NamespaceProjectsView";
import {Avatar, Button, DLayout, Flex, Spacing, Text} from "@code0-tech/pictor";
import {NamespaceOverviewSideView} from "@edition/dashboard/namespace/NamespaceOverviewSideView";

export const NamespaceProjectsPage: React.FC = () => {
    return <DLayout rightContent={<NamespaceOverviewSideView/>}>
        <NamespaceProjectsView/>
    </DLayout>
}