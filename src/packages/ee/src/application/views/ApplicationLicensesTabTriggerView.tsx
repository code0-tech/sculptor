import React from "react";
import {IconLicense} from "@tabler/icons-react";
import {SettingDialogTab} from "@core/components/SettingDialog";
import {ApplicationLicensesView} from "@edition/application/views/ApplicationLicensesView";

export const ApplicationLicensesTab: SettingDialogTab | undefined = {
    value: "license",
    label: "Licenses",
    icon: IconLicense,
    content: <ApplicationLicensesView/>
}
