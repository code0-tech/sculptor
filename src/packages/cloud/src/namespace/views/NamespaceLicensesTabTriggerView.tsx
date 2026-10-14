import React from "react";
import {IconLicense} from "@tabler/icons-react";
import {SettingDialogTab} from "@core/components/SettingDialog";
import {NamespaceLicensesView} from "@edition/namespace/views/NamespaceLicensesView";

export const NamespaceLicensesTab: SettingDialogTab | undefined = {
    value: "licenses",
    label: "Licenses",
    icon: IconLicense,
    content: <NamespaceLicensesView/>
}
