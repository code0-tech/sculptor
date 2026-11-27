"use client"

import {ModuleOverviewPage} from "@edition/module/pages/ModuleOverviewPage";
import {ModuleConfigurationPage} from "@ce-internal/module/pages/ModuleConfigurationPage";

export default function Page() {
    return <>
        <ModuleOverviewPage/>
        <ModuleConfigurationPage/>
    </>
}
