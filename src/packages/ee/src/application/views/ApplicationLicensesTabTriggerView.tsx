import React from "react";
import {IconSparkles} from "@tabler/icons-react";
import {SettingDialogTab} from "@core/components/SettingDialog";
import {ApplicationLicensesView} from "@edition/application/views/ApplicationLicensesView";

export const ApplicationLicensesTab: SettingDialogTab | undefined = {
    value: "license",
    label: "Subscriptions",
    icon: IconSparkles,
    content: <ApplicationLicensesView/>
}
