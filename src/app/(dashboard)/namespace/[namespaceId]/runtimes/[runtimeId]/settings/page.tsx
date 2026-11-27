"use client"

import {NamespaceOverviewPage} from "@edition/namespace/pages/NamespaceOverviewPage";
import {RuntimeSettingsPage} from "@edition/runtime/pages/RuntimeSettingsPage";

export default function Page() {
    return <>
        <NamespaceOverviewPage/>
        <RuntimeSettingsPage/>
    </>
}
